import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import ScheduledEmail from "@/models/scheduledEmailModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET() {
    try {
        // Get all users
        const users = await User.find().select('-password -forgotPasswordToken -forgotPasswordTokenExpiry -verifyToken -verifyTokenExpiry');
        
        // Get email counts for each user
        const emailCounts = await ScheduledEmail.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map of user ID to email count
        const emailCountMap = emailCounts.reduce((acc: {[key: string]: number}, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});

        // Add email count to each user
        const usersWithEmailCount = users.map(user => {
            const userObj = user.toObject();
            return {
                ...userObj,
                emailCount: emailCountMap[user._id.toString()] || 0
            };
        });

        return NextResponse.json({
            message: "Users found successfully",
            users: usersWithEmailCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 