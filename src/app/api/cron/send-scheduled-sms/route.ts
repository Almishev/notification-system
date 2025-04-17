import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import ScheduledSMS from '@/models/scheduledSMSModel';
import MessageStats from '@/models/messageStatsModel';
import { sendSMS } from '@/helpers/twilio';

// Свързваме се с базата данни
console.log('[CRON SMS] Connecting to database...');
connect();

// Интерфейс за резултатния обект
interface SMSResult {
    id: string;
    phoneNumber: string;
    status: string;
    error?: string;
}

export async function GET(request: NextRequest) {
    console.log('[CRON SMS] Starting scheduled SMS sending process...');
    
    try {
        // Проверяваме Twilio конфигурацията
        console.log('[CRON SMS] Checking Twilio configuration...', {
            ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
            AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
            PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set'
        });
        
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            console.error('[CRON SMS] Missing Twilio configuration!');
            return NextResponse.json({ error: "Missing Twilio configuration" }, { status: 500 });
        }
        
        // Текуща дата и час за сравнение
        const now = new Date();
        console.log(`[CRON SMS] Current server time: ${now.toISOString()} (${now.toString()})`);
        
        console.log('[CRON SMS] Looking for pending SMS messages...');
        
        // Намираме всички планирани SMS съобщения, които трябва да бъдат изпратени
        const pendingSMS = await ScheduledSMS.find({
            status: 'pending',
            scheduledDate: { $lte: now }
        });

        console.log(`[CRON SMS] Found ${pendingSMS.length} pending SMS messages ready to send`);
        
        // Логваме всички намерени съобщения
        pendingSMS.forEach((sms, index) => {
            console.log(`[CRON SMS] Message #${index + 1}:`, {
                id: sms._id.toString(),
                phoneNumber: sms.phoneNumber,
                scheduledDate: sms.scheduledDate.toISOString(),
                currentTime: now.toISOString(),
                shouldSend: sms.scheduledDate <= now
            });
        });

        if (pendingSMS.length === 0) {
            console.log('[CRON SMS] No pending SMS messages to send.');
            return NextResponse.json({ message: "Няма SMS съобщения за изпращане" });
        }

        const results = {
            success: 0,
            failed: 0,
            details: [] as SMSResult[]
        };

        // Обработваме всяко SMS съобщение
        console.log('[CRON SMS] Processing SMS messages...');
        
        for (const sms of pendingSMS) {
            try {
                console.log(`[CRON SMS] Processing SMS ${sms._id} to ${sms.phoneNumber}`);
                
                // Маркираме SMS като "обработващо се"
                sms.status = 'processing';
                await sms.save();
                console.log(`[CRON SMS] SMS ${sms._id} marked as processing`);

                // Изпращаме SMS чрез Twilio API
                console.log(`[CRON SMS] Sending SMS ${sms._id} via Twilio API...`);
                const response = await sendSMS(sms.phoneNumber, sms.message);
                console.log(`[CRON SMS] Received response from Twilio:`, response);

                // Запазваме отговора и актуализираме статуса
                sms.apiResponse = response;
                
                // Проверяваме отговора от Twilio
                if (response && response.success) {
                    sms.status = 'sent';
                    results.success++;
                    console.log(`[CRON SMS] SMS ${sms._id} sent successfully`);
                } else {
                    sms.status = 'failed';
                    sms.error = response.error || 'Невалиден отговор от Twilio';
                    results.failed++;
                    console.log(`[CRON SMS] SMS ${sms._id} failed to send. Error: ${sms.error}`);
                }

                // Запазваме актуализираното съобщение
                await sms.save();
                console.log(`[CRON SMS] SMS ${sms._id} updated in database with status: ${sms.status}`);
                
                results.details.push({
                    id: sms._id.toString(),
                    phoneNumber: sms.phoneNumber,
                    status: sms.status
                });
                
            } catch (error: any) {
                console.error(`[CRON SMS] Error processing SMS ${sms._id}:`, error);
                
                // В случай на грешка, маркираме SMS като неуспешно
                sms.status = 'failed';
                sms.error = error.message || 'Unknown error';
                await sms.save();
                console.log(`[CRON SMS] SMS ${sms._id} marked as failed due to error: ${sms.error}`);
                
                results.failed++;
                results.details.push({
                    id: sms._id.toString(),
                    phoneNumber: sms.phoneNumber,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log('[CRON SMS] Completed SMS processing. Results:', {
            success: results.success,
            failed: results.failed
        });

        // Актуализираме статистиката, ако има обработени SMS съобщения
        if (results.success > 0 || results.failed > 0) {
            try {
                console.log('[CRON SMS] Updating message statistics...');
                
                // Намираме или създаваме запис за статистика
                let stats = await MessageStats.findOne();
                if (!stats) {
                    stats = new MessageStats();
                    console.log('[CRON SMS] Created new message stats record');
                } else {
                    console.log('[CRON SMS] Found existing message stats record');
                }
                
                // Актуализираме статистиката за SMS
                stats.totalSMSSent += results.success + results.failed;
                stats.successfulSMSSent += results.success;
                stats.failedSMSSent += results.failed;
                stats.lastUpdated = new Date();
                
                await stats.save();
                console.log(`[CRON SMS] Message stats updated: ${results.success} successful, ${results.failed} failed SMS`);
            } catch (statsError: any) {
                console.error('[CRON SMS] Failed to update message statistics:', statsError);
            }
        }

        // Почистваме стари SMS съобщения (по-стари от 7 дни)
        try {
            console.log('[CRON SMS] Cleaning up old SMS messages...');
            
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            console.log(`[CRON SMS] Deleting messages older than: ${sevenDaysAgo.toISOString()}`);
            
            const deleteResult = await ScheduledSMS.deleteMany({
                $or: [
                    { status: 'sent', updatedAt: { $lt: sevenDaysAgo } },
                    { status: 'failed', updatedAt: { $lt: sevenDaysAgo } }
                ]
            });

            console.log(`[CRON SMS] Cleaned up ${deleteResult.deletedCount} old SMS messages`);
        } catch (cleanupError: any) {
            console.error('[CRON SMS] Error during cleanup of old messages:', cleanupError);
        }

        console.log('[CRON SMS] Sending final response with results');
        return NextResponse.json({
            message: `Обработени ${pendingSMS.length} SMS съобщения`,
            results,
            environmentCheck: {
                twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_PHONE_NUMBER
            }
        });

    } catch (error: any) {
        console.error("[CRON SMS] Fatal error in SMS processing:", error);
        return NextResponse.json({ 
            error: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}