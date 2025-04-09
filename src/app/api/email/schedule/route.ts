import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import cron from 'node-cron';
import nodemailer from "nodemailer";

// Connect to database
connect();

// Create a transporter using Gmail SMTP
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

// Function to send email
async function sendEmail(scheduledEmail: any) {
    try {
        // First, try to update the email status to 'processing'
        // Using findOneAndUpdate with optimistic locking to prevent race conditions
        const emailToProcess = await ScheduledEmail.findOneAndUpdate(
            {
                _id: scheduledEmail._id,
                status: 'pending' // Only update if status is still pending
            },
            { status: 'processing' },
            { new: true }
        );

        // If email was not found or was already being processed, return
        if (!emailToProcess) {
            console.log(`Email ${scheduledEmail._id} was already processed or not found`);
            return;
        }

        // Send individual emails to each recipient
        for (const recipient of scheduledEmail.recipients) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: scheduledEmail.subject,
                text: scheduledEmail.message,
            });
        }

        // Delete the email after successful sending
        await ScheduledEmail.findByIdAndDelete(scheduledEmail._id);
        console.log(`Email ${scheduledEmail._id} sent and deleted successfully`);

    } catch (error) {
        console.error('Error sending scheduled email:', error);
        // Update status to failed if sending fails
        await ScheduledEmail.findByIdAndUpdate(
            scheduledEmail._id,
            { 
                status: 'failed',
                error: error.message
            }
        );
    }
}

// Initialize cron jobs
cron.schedule('* * * * *', async () => {
    try {
        // Find all pending emails that are due to be sent
        const pendingEmails = await ScheduledEmail.find({
            status: 'pending',
            scheduledDate: { $lte: new Date() }
        });

        // Send each pending email
        for (const email of pendingEmails) {
            await sendEmail(email);
        }

        // Clean up failed emails older than 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Also clean up any stuck 'processing' emails older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await ScheduledEmail.updateMany(
            {
                status: 'processing',
                updatedAt: { $lt: oneHourAgo }
            },
            { status: 'failed', error: 'Email processing timeout' }
        );

        // Delete failed emails
        await ScheduledEmail.deleteMany({
            status: 'failed',
            updatedAt: { $lt: oneDayAgo }
        });

    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// GET endpoint to fetch scheduled emails for the current user
export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch all scheduled emails for the user
        const scheduledEmails = await ScheduledEmail.find({ createdBy: userId })
            .sort({ scheduledDate: -1 }); // Sort by scheduled date, newest first

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

// POST endpoint to create a new scheduled email
export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get email data from request body
        const { recipients, subject, message, scheduledDate } = await request.json();

        // Validate email data
        if (!recipients?.length || !subject || !message || !scheduledDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate email format for all recipients
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            return NextResponse.json(
                { error: `Invalid email format for: ${invalidEmails.join(', ')}` },
                { status: 400 }
            );
        }

        // Create new scheduled email
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