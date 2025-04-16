import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import MessageStats from "@/models/messageStatsModel";
import User from "@/models/userModel";
import nodemailer from "nodemailer";

connect();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function GET(request: NextRequest) {
    try {
        console.log('Starting scheduled email processing...');
        
        // Find all pending emails that are due to be sent
        const now = new Date();
        const pendingEmails = await ScheduledEmail.find({
            status: 'pending',
            scheduledDate: { $lte: now }
        }).sort({ scheduledDate: 1 }); // Process oldest emails first

        console.log(`Found ${pendingEmails.length} pending emails to process`);
        const results = [];

        // Initiate statistics counters
        let successCount = 0;
        let failCount = 0;

        for (const email of pendingEmails) {
            try {
                console.log(`Processing email ${email._id}...`);
                
                // Update status to processing
                email.status = 'processing';
                await email.save();

                // Send email to all recipients
                for (const recipient of email.recipients) {
                    console.log(`Sending email to ${recipient}...`);
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: recipient,
                        subject: email.subject,
                        text: email.message,
                        html: email.message,
                    });
                }

                // Update status to sent
                email.status = 'sent';
                await email.save();
                
                // Increment success counter
                successCount++;
                
                // Актуализиране на броячите на потребителя
                if (email.createdBy) {
                    await User.findByIdAndUpdate(
                        email.createdBy,
                        {
                            $inc: {
                                'emailStats.totalSent': 1,
                                'emailStats.successful': 1
                            }
                        }
                    );
                }
                
                console.log(`Email ${email._id} sent successfully`);

                results.push({
                    id: email._id,
                    status: 'success',
                    message: 'Email sent successfully'
                });
            } catch (error: any) {
                console.error(`Error processing email ${email._id}:`, error);
                
                // Update status to failed
                email.status = 'failed';
                email.error = error.message;
                await email.save();

                // Increment failure counter
                failCount++;
                
                // Актуализиране на броячите на потребителя при грешка
                if (email.createdBy) {
                    await User.findByIdAndUpdate(
                        email.createdBy,
                        {
                            $inc: {
                                'emailStats.totalSent': 1,
                                'emailStats.failed': 1
                            }
                        }
                    );
                }

                results.push({
                    id: email._id,
                    status: 'error',
                    message: error.message
                });
            }
        }

        // Update statistics if any emails were processed
        if (successCount > 0 || failCount > 0) {
            // Get or create stats document
            let stats = await MessageStats.findOne();
            if (!stats) {
                stats = new MessageStats();
            }
            
            // Update email stats
            stats.totalEmailsSent += successCount + failCount;
            stats.successfulEmailsSent += successCount;
            stats.failedEmailsSent += failCount;
            stats.lastUpdated = new Date();
            
            await stats.save();
            console.log(`Updated message statistics: ${successCount} successful, ${failCount} failed`);
        }

        // Clean up old emails (older than 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const deletedCount = await ScheduledEmail.deleteMany({
            $or: [
                { status: 'sent', updatedAt: { $lt: sevenDaysAgo } },
                { status: 'failed', updatedAt: { $lt: sevenDaysAgo } }
            ]
        });

        console.log(`Cleaned up ${deletedCount.deletedCount} old emails`);

        return NextResponse.json({
            success: true,
            message: `Processed ${pendingEmails.length} emails`,
            results
        });

    } catch (error: any) {
        console.error('Error in email processing:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}