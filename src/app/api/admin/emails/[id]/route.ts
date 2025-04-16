import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ScheduledEmail from "@/models/scheduledEmailModel";

connect();

// Helper function to check if user is admin
async function isAdmin(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const currentUser = await User.findById(userId);
        return currentUser?.isAdmin === true;
    } catch {
        return false;
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        const deletedEmail = await ScheduledEmail.findByIdAndDelete(params.id);
        
        if (!deletedEmail) {
            return NextResponse.json(
                { error: "Email not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Email deleted successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 