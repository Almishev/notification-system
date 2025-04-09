import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import ScheduledEmail from "@/models/scheduledEmailModel";
import nodemailer from "nodemailer";

connect();

// Configure nodemailer for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function POST(request: NextRequest) {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Clean up old failed emails
        await ScheduledEmail.deleteMany({
            status: 'failed',
            updatedAt: { $lt: oneDayAgo }
        });

        // Reset stuck emails
        await ScheduledEmail.updateMany(
            {
                status: 'processing',
                updatedAt: { $lt: oneHourAgo }
            },
            {
                $set: {
                    status: 'failed',
                    error: 'Email processing timed out'
                }
            }
        );

        // Find and lock one pending email that's due
        const email = await ScheduledEmail.findOneAndUpdate(
            {
                status: 'pending',
                scheduledDate: { $lte: now }
            },
            {
                $set: {
                    status: 'processing',
                    updatedAt: now
                }
            },
            { new: true }
        );

        if (!email) {
            return NextResponse.json({ message: "No emails to send" });
        }

        try {
            // Send email with simple configuration
            const mailOptions = {
                from: {
                    name: 'Mineral Hotel',
                    address: process.env.EMAIL_USER as string
                },
                to: email.recipients.join(', '),
                subject: email.subject,
                text: email.message
            };

            await transporter.sendMail(mailOptions);

            // Delete the email after successful sending
            await ScheduledEmail.findByIdAndDelete(email._id);

            return NextResponse.json({
                message: "Email sent successfully",
                success: true
            });

        } catch (sendError: any) {
            console.error("Error sending email:", sendError);
            // Mark as failed if sending fails
            await ScheduledEmail.findByIdAndUpdate(email._id, {
                status: 'failed',
                error: sendError.message || 'Failed to send email'
            });

            throw sendError;
        }

    } catch (error: any) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: error.message || "Error sending email" }, { status: 500 });
    }
} 