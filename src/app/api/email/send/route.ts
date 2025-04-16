import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Email sending API endpoint" });
}

// Redirect POSTs to the actual email sending implementation
export async function POST(request: NextRequest) {
  // This is a router endpoint that can be extended with more functionality
  // Currently just returns a message, but could be modified to handle different email types
  return NextResponse.json({ 
    message: "Please use a specific email sending endpoint",
    endpoints: {
      email: "/api/email/send/email"
    }
  });
}