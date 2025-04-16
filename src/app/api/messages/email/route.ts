import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        
        const messages = await ScheduledEmail.find({ createdBy: userId })
            .sort({ scheduledDate: -1 });

        return NextResponse.json({
            success: true,
            data: messages
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { recipients, subject, message, scheduledDate } = reqBody;

        // Validate inputs
        if (!recipients || recipients.length === 0) {
            return NextResponse.json(
                { error: "At least one recipient is required" },
                { status: 400 }
            );
        }

        if (!subject || !message) {
            return NextResponse.json(
                { error: "Subject and message are required" },
                { status: 400 }
            );
        }

        if (!scheduledDate) {
            return NextResponse.json(
                { error: "Scheduled date is required" },
                { status: 400 }
            );
        }

        // Parse and validate scheduled date
        const scheduledDateTime = new Date(scheduledDate);
        const now = new Date();
        
        // Check if the date is valid
        if (isNaN(scheduledDateTime.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Check if the date is in the future
        if (scheduledDateTime <= now) {
            return NextResponse.json(
                { error: "Scheduled date must be in the future" },
                { status: 400 }
            );
        }

        // Create new scheduled email
        const newScheduledEmail = new ScheduledEmail({
            recipients,
            subject,
            message,
            scheduledDate: scheduledDateTime,
            createdBy: userId,
            status: 'pending'
        });

        const savedEmail = await newScheduledEmail.save();

        return NextResponse.json({
            message: "Email scheduled successfully",
            success: true,
            data: savedEmail
        });

    } catch (error: any) {
        console.error("Error scheduling email:", error);
        return NextResponse.json({ 
            error: error.message || "Error scheduling email" 
        }, { status: 500 });
    }
} 