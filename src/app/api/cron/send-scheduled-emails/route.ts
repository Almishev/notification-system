import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import Stats from "@/models/messageStatsModel";
import nodemailer from "nodemailer";

// Свързваме се с базата данни
connect();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function GET(request: NextRequest) {
    try {
        console.log("Starting scheduled email sending process...");
        
        // Проверяваме дали имаме настроени всички необходими променливи
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Missing email configuration. Please check environment variables.");
            return NextResponse.json({ error: "Missing email configuration" }, { status: 500 });
        }
        
        const now = new Date();
        console.log("Current server time:", now.toISOString());
        console.log("Current server timezone offset:", now.getTimezoneOffset() / -60); // Показва часовата зона като часове разлика от UTC
        
        // Получаваме всички планирани имейли
        const allEmails = await ScheduledEmail.find();
        console.log("All scheduled emails in system:", allEmails.map(email => ({
            id: email._id,
            recipients: email.recipients,
            subject: email.subject,
            status: email.status,
            scheduledDate: email.scheduledDate,
            createdAt: email.createdAt
        })));
        
        // Намираме имейлите, които трябва да се изпратят
        const pendingEmails = await ScheduledEmail.find({
            status: 'pending',
            scheduledDate: { $lte: now }
        });
        
        console.log(`Found ${pendingEmails.length} pending emails ready to send (scheduled before or at ${now.toISOString()})`);
        
        if (pendingEmails.length > 0) {
            console.log("Pending emails details:", pendingEmails.map(email => ({
                id: email._id,
                recipients: email.recipients,
                subject: email.subject,
                scheduledDate: email.scheduledDate,
                scheduledTimestamp: email.scheduledDate.getTime(),
                currentTimestamp: now.getTime(),
                shouldSend: email.scheduledDate.getTime() <= now.getTime()
            })));
        }
        
        let successCount = 0;
        let errorCount = 0;

        for (const email of pendingEmails) {
            try {
                console.log(`Sending email ${email._id} to ${email.recipients.join(', ')}`);
                
                // Изпращане на имейла
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email.recipients.join(', '),
                    subject: email.subject,
                    text: email.message
                });
                
                console.log(`Email ${email._id} sent successfully`);
                successCount++;

                // Увеличаване на брояча
                let stats = await Stats.findOne();
                if (!stats) {
                    stats = new Stats();
                }
                stats.count += 1;
                await stats.save();

                // Изтриване на имейла
                await ScheduledEmail.findByIdAndDelete(email._id);
                console.log(`Email ${email._id} removed from queue`);

            } catch (error) {
                console.error(`Error sending email ${email._id}:`, error);
                errorCount++;
                email.status = 'failed';
                email.error = error instanceof Error ? error.message : 'Unknown error';
                await email.save();
                console.log(`Email ${email._id} marked as failed`);
            }
        }

        // Почистване на стари failed имейли
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const deleteResult = await ScheduledEmail.deleteMany({
            status: 'failed',
            updatedAt: { $lt: sevenDaysAgo }
        });
        console.log(`Cleaned up ${deleteResult.deletedCount} old failed emails`);

        return NextResponse.json({ 
            success: true, 
            currentTime: now.toISOString(),
            timezone: now.getTimezoneOffset() / -60,
            emailsProcessed: pendingEmails.length,
            emailsSent: successCount,
            emailsFailed: errorCount,
            allEmailsCount: allEmails.length
        });
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        }, { status: 500 });
    }
}