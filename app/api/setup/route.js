import { auth } from "@/auth";  // Import NextAuth session
import connectMongo from "@/libs/mongoose";
import SetupResponse from "@/models/SetupResponse";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await auth(); // Get logged-in user session

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const body = await req.json();

    // Check if user already has a setup response
    const existingResponse = await SetupResponse.findOne({ userId: session.user.id });
    
    if (existingResponse) {
      // Update existing response
      await SetupResponse.findByIdAndUpdate(existingResponse._id, body);
      return NextResponse.json({ 
        message: "Survey response updated", 
        redirect: "/dashboard" 
      }, { status: 200 });
    } else {
      // Create new response
      const newResponse = new SetupResponse({
        userId: session.user.id,
        ...body,
      });

      await newResponse.save();
      return NextResponse.json({ 
        message: "Survey response saved", 
        redirect: "/dashboard" 
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving survey response:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Add a GET endpoint to check if user has completed setup
export async function GET() {
  const session = await auth();
  console.log("Setup API GET called, session:", session ? "exists" : "null");

  if (!session || !session.user) {
    console.log("Unauthorized: No valid session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();
    console.log("MongoDB connected, user ID:", session.user.id);
    
    // Check if user has a setup response
    const existingResponse = await SetupResponse.findOne({ userId: session.user.id });
    console.log("Setup response found:", existingResponse ? "yes" : "no");
    
    return NextResponse.json({ 
      hasSetup: !!existingResponse 
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking setup status:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message 
    }, { status: 500 });
  }
}