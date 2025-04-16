import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import ScheduledEmail from "@/models/scheduledEmailModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getDataFromToken(request);
        const { id } = params;

        const email = await ScheduledEmail.findOne({ _id: id, createdBy: userId });
        
        if (!email) {
            return NextResponse.json(
                { error: "Email not found or unauthorized" },
                { status: 404 }
            );
        }

        await ScheduledEmail.deleteOne({ _id: id });

        return NextResponse.json({
            message: "Email deleted successfully",
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 