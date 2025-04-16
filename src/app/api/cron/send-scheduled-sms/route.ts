import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import ScheduledSMS from '@/models/scheduledSMSModel';
import MessageStats from '@/models/messageStatsModel';
import { sendSMS } from '@/helpers/bulkgate';

// Свързваме се с базата данни
connect();

// Интерфейс за резултатния обект
interface SMSResult {
    id: string;
    phoneNumber: string;
    status: string;
    error?: string;
}

export async function GET(request: NextRequest) {
    try {
        // Намираме всички планирани SMS съобщения, които трябва да бъдат изпратени
        const pendingSMS = await ScheduledSMS.find({
            status: 'pending',
            scheduledDate: { $lte: new Date() }
        });

        if (pendingSMS.length === 0) {
            return NextResponse.json({ message: "Няма SMS съобщения за изпращане" });
        }

        const results = {
            success: 0,
            failed: 0,
            details: [] as SMSResult[]
        };

        // Обработваме всяко SMS съобщение
        for (const sms of pendingSMS) {
            try {
                // Маркираме SMS като "обработващо се"
                sms.status = 'processing';
                await sms.save();

                // Изпращаме SMS чрез BulkGate API
                const response = await sendSMS({
                    phoneNumber: sms.phoneNumber,
                    message: sms.message
                });

                // Запазваме отговора и актуализираме статуса
                sms.bulkgateResponse = response;
                
                // Проверяваме отговора от BulkGate
                // Структурата на отговора може да варира според документацията на BulkGate
                if (response && response.data && response.data.status === 0) {
                    sms.status = 'sent';
                    results.success++;
                } else {
                    sms.status = 'failed';
                    sms.error = 'Невалиден отговор от BulkGate';
                    results.failed++;
                }

                // Запазваме актуализираното съобщение
                await sms.save();
                results.details.push({
                    id: sms._id.toString(),
                    phoneNumber: sms.phoneNumber,
                    status: sms.status
                });
                
            } catch (error: any) {
                // В случай на грешка, маркираме SMS като неуспешно
                sms.status = 'failed';
                sms.error = error.message || 'Unknown error';
                await sms.save();
                
                results.failed++;
                results.details.push({
                    id: sms._id.toString(),
                    phoneNumber: sms.phoneNumber,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        // Актуализираме статистиката, ако има обработени SMS съобщения
        if (results.success > 0 || results.failed > 0) {
            // Намираме или създаваме запис за статистика
            let stats = await MessageStats.findOne();
            if (!stats) {
                stats = new MessageStats();
            }
            
            // Актуализираме статистиката за SMS
            stats.totalSMSSent += results.success + results.failed;
            stats.successfulSMSSent += results.success;
            stats.failedSMSSent += results.failed;
            stats.lastUpdated = new Date();
            
            await stats.save();
            console.log(`Актуализирана статистика за съобщения: ${results.success} успешни, ${results.failed} неуспешни SMS`);
        }

        // Почистваме стари SMS съобщения (по-стари от 7 дни)
        const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        const deletedCount = await ScheduledSMS.deleteMany({
            $or: [
                { status: 'sent', updatedAt: { $lt: sevenDaysAgo } },
                { status: 'failed', updatedAt: { $lt: sevenDaysAgo } }
            ]
        });

        console.log(`Почистени ${deletedCount.deletedCount} стари SMS съобщения`);

        return NextResponse.json({
            message: `Обработени ${pendingSMS.length} SMS съобщения`,
            results
        });

    } catch (error: any) {
        console.error("Грешка при изпращане на SMS съобщения:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}