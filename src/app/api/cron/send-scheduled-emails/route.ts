import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import Stats from "@/models/messageStatsModel";
import nodemailer from "nodemailer";

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
        const now = new Date();
        const pendingEmails = await ScheduledEmail.find({
            status: 'pending',
            scheduledDate: { $lte: now }
        });

        for (const email of pendingEmails) {
            try {
                // Изпращане на имейла
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email.recipients.join(', '),
                    subject: email.subject,
                    text: email.message
                });

                // Увеличаване на брояча
                let stats = await Stats.findOne();
                if (!stats) {
                    stats = new Stats();
                }
                stats.count += 1;
                await stats.save();

                // Изтриване на имейла
                await ScheduledEmail.findByIdAndDelete(email._id);

            } catch (error) {
                console.error(`Error sending email: ${error}`);
                email.status = 'failed';
                email.error = error instanceof Error ? error.message : 'Unknown error';
                await email.save();
            }
        }

        // Почистване на стари failed имейли
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        await ScheduledEmail.deleteMany({
            status: 'failed',
            updatedAt: { $lt: sevenDaysAgo }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}