import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Stats from "@/models/messageStatsModel";

connect();

// Get current statistics
export async function GET(request: NextRequest) {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats();
            await stats.save();
        }
        return NextResponse.json({ count: stats.count });
    } catch (error) {
        return NextResponse.json({ error: 'Error getting stats' }, { status: 500 });
    }
}

// Reset statistics if needed
export async function POST(request: NextRequest) {
    try {
        await Stats.updateOne({}, { count: 0 }, { upsert: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error resetting stats' }, { status: 500 });
    }
}