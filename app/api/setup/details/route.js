import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import SetupResponse from "@/models/SetupResponse";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    // Find the user's setup response
    const setupResponse = await SetupResponse.findOne({ userId: session.user.id });
    
    if (!setupResponse) {
      return NextResponse.json({ 
        error: "Setup data not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      data: setupResponse
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching setup details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 