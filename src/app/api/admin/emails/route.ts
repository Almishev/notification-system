import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ScheduledEmail from "@/models/scheduledEmailModel";

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const currentUser = await User.findById(userId);

        if (!currentUser || !currentUser.isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        const emails = await ScheduledEmail.find()
            .populate('createdBy', 'username email -_id')
            .sort({ scheduledDate: -1 });

        return NextResponse.json({ emails });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 