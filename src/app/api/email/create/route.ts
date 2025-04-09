import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import ScheduledEmail from "@/models/scheduledEmailModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { 
            recipients, 
            subject, 
            message, 
            scheduledDate
        } = reqBody;

        // Get user ID from token
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate inputs
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 });
        }

        // Convert single email to array if needed
        const emailList = Array.isArray(recipients) ? recipients : [recipients];

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
            return NextResponse.json({ 
                error: `Invalid email format for: ${invalidEmails.join(', ')}` 
            }, { status: 400 });
        }

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
        }

        if (!scheduledDate || new Date(scheduledDate) < new Date()) {
            return NextResponse.json({ error: "Valid future scheduled date is required" }, { status: 400 });
        }

        // Create new scheduled email
        const newEmail = new ScheduledEmail({
            recipients: emailList,
            subject,
            message,
            scheduledDate: new Date(scheduledDate),
            createdBy: userId,
            status: 'pending'
        });

        await newEmail.save();

        return NextResponse.json({
            message: "Email scheduled successfully",
            success: true,
            email: newEmail
        });

    } catch (error: any) {
        console.error("Error scheduling email:", error);
        return NextResponse.json({ error: error.message || "Error scheduling email" }, { status: 500 });
    }
} 