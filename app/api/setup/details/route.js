import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import SetupResponse from "@/models/SetupResponse";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  console.log("Setup details API called, session:", session ? "exists" : "null");

  if (!session || !session.user) {
    console.log("Unauthorized: No valid session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();
    console.log("MongoDB connected successfully");
    
    // Find the user's setup response
    console.log("Looking for setup response for user:", session.user.id);
    const setupResponse = await SetupResponse.findOne({ userId: session.user.id });
    console.log("Setup response found:", setupResponse ? "yes" : "no");
    
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
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message 
    }, { status: 500 });
  }
} 