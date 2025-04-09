import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import ScheduledEmail from "@/models/scheduledEmailModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { 
            emailId,
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

        // Validate emailId
        if (!emailId) {
            return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
        }

        // Find the email and verify ownership
        const existingEmail = await ScheduledEmail.findOne({
            _id: emailId,
            createdBy: userId
        });

        if (!existingEmail) {
            return NextResponse.json({ error: "Email not found or unauthorized" }, { status: 404 });
        }

        // Verify email hasn't been sent
        if (existingEmail.status !== 'pending') {
            return NextResponse.json({ 
                error: "Cannot edit email that is being processed or has failed" 
            }, { status: 400 });
        }

        // Validate inputs
        if (recipients) {
            const emailList = Array.isArray(recipients) ? recipients : [recipients];
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emailList.filter(email => !emailRegex.test(email));
            if (invalidEmails.length > 0) {
                return NextResponse.json({ 
                    error: `Invalid email format for: ${invalidEmails.join(', ')}` 
                }, { status: 400 });
            }
            existingEmail.recipients = emailList;
        }

        if (subject) {
            existingEmail.subject = subject;
        }

        if (message) {
            existingEmail.message = message;
        }

        if (scheduledDate) {
            if (new Date(scheduledDate) < new Date()) {
                return NextResponse.json({ 
                    error: "Scheduled date must be in the future" 
                }, { status: 400 });
            }
            existingEmail.scheduledDate = new Date(scheduledDate);
        }

        // Save changes
        await existingEmail.save();

        return NextResponse.json({
            message: "Email updated successfully",
            success: true,
            email: existingEmail
        });

    } catch (error: any) {
        console.error("Error updating email:", error);
        return NextResponse.json({ error: error.message || "Error updating email" }, { status: 500 });
    }
} 