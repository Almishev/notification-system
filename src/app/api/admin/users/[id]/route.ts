import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        const { isAdmin: newIsAdmin } = await request.json();
        
        if (typeof newIsAdmin !== 'boolean') {
            return NextResponse.json(
                { error: "Invalid admin status" },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { isAdmin: newIsAdmin },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        const userId = await getDataFromToken(request);
        if (params.id === userId) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(params.id);
        
        if (!deletedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "User deleted successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 