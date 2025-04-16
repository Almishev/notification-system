import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import MessageStats from "@/models/messageStatsModel";
import User from "@/models/userModel";
import cron from 'node-cron';
import nodemailer from "nodemailer";

connect();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(scheduledEmail: any) {
    try {
        const emailToProcess = await ScheduledEmail.findOneAndUpdate(
            {
                _id: scheduledEmail._id,
                status: 'pending' 
            },
            { status: 'processing' },
            { new: true }
        );

        if (!emailToProcess) {
            console.log(`Email ${scheduledEmail._id} was already processed or not found`);
            return;
        }

        for (const recipient of scheduledEmail.recipients) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: scheduledEmail.subject,
                text: scheduledEmail.message,
            });
        }

        let stats = await MessageStats.findOne();
        if (!stats) {
            stats = new MessageStats();
        }
        
        stats.totalEmailsSent += 1;
        stats.successfulEmailsSent += 1;
        stats.lastUpdated = new Date();
        
        await stats.save();

        await User.findByIdAndUpdate(
            scheduledEmail.createdBy,
            {
                $inc: {
                    'emailStats.totalSent': 1,
                    'emailStats.successful': 1
                }
            }
        );
        
        console.log(`Updated message statistics for email ${scheduledEmail._id}`);

        await ScheduledEmail.findByIdAndDelete(scheduledEmail._id);
        console.log(`Email ${scheduledEmail._id} sent and deleted successfully`);

    } catch (error) {
        console.error('Error sending scheduled email:', error);
        
        let stats = await MessageStats.findOne();
        if (!stats) {
            stats = new MessageStats();
        }
        
        stats.totalEmailsSent += 1;
        stats.failedEmailsSent += 1;
        stats.lastUpdated = new Date();
        
        await stats.save();
        
        await User.findByIdAndUpdate(
            scheduledEmail.createdBy,
            {
                $inc: {
                    'emailStats.totalSent': 1,
                    'emailStats.failed': 1
                }
            }
        );
        
        await ScheduledEmail.findByIdAndUpdate(
            scheduledEmail._id,
            { 
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        );
    }
}

cron.schedule('* * * * *', async () => {
    try {
        const pendingEmails = await ScheduledEmail.find({
            status: 'pending',
            scheduledDate: { $lte: new Date() }
        });

        for (const email of pendingEmails) {
            await sendEmail(email);
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await ScheduledEmail.updateMany(
            {
                status: 'processing',
                updatedAt: { $lt: oneHourAgo }
            },
            { status: 'failed', error: 'Email processing timeout' }
        );

        await ScheduledEmail.deleteMany({
            status: 'failed',
            updatedAt: { $lt: oneDayAgo }
        });

    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const scheduledEmails = await ScheduledEmail.find({ createdBy: userId })
            .sort({ scheduledDate: -1 }); 

        return NextResponse.json(
            { scheduledEmails },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error fetching scheduled emails:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { recipients, subject, message, scheduledDate } = await request.json();

        if (!recipients?.length || !subject || !message || !scheduledDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            return NextResponse.json(
                { error: `Invalid email format for: ${invalidEmails.join(', ')}` },
                { status: 400 }
            );
        }

        const scheduledEmail = await ScheduledEmail.create({
            recipients,
            subject,
            message,
            scheduledDate,
            createdBy: userId
        });

        return NextResponse.json(
            { 
                message: "Email scheduled successfully",
                scheduledEmail 
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error scheduling email:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}