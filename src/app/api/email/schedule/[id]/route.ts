import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";

connect();

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Find and delete the email, but only if it belongs to the current user
        const deletedEmail = await ScheduledEmail.findOneAndDelete({
            _id: params.id,
            createdBy: userId
        });

        if (!deletedEmail) {
            return NextResponse.json(
                { error: "Email not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Email deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error deleting email:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
} 