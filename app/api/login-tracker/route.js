import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import UserLogin from "@/models/UserLogin";
import { NextResponse } from "next/server";

// Get login history for the current user
export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    // Find or create user login record
    let userLogin = await UserLogin.findOne({ userId: session.user.id });
    
    if (!userLogin) {
      userLogin = {
        userId: session.user.id,
        loginDates: [],
        coins: 0
      };
    }
    
    // Get user to include total coins
    const user = await User.findById(session.user.id);
    
    return NextResponse.json({ 
      loginDates: userLogin.loginDates,
      coins: user.coins || 0
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Handle daily check-in
export async function POST() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    // Get today's date in UTC
    const today = new Date();
    
    // Convert to user's local date string (YYYY-MM-DD) to handle timezone differences
    const todayDateString = today.toISOString().split('T')[0];
    
    console.log('API - Today date string:', todayDateString);
    
    // Find or create user login record
    let userLogin = await UserLogin.findOne({ userId: session.user.id });
    
    if (!userLogin) {
      userLogin = new UserLogin({
        userId: session.user.id,
        loginDates: [],
        coins: 0
      });
    }
    
    console.log('API - User login dates:', userLogin.loginDates);
    
    // Check if user already logged in today by comparing date strings
    const alreadyLoggedInToday = userLogin.loginDates.some(date => {
      const loginDateString = new Date(date).toISOString().split('T')[0];
      const isSameDay = loginDateString === todayDateString;
      console.log('API - Comparing date strings:', loginDateString, todayDateString, isSameDay);
      return isSameDay;
    });
    
    console.log('API - Already logged in today:', alreadyLoggedInToday);
    
    if (alreadyLoggedInToday) {
      return NextResponse.json({ 
        message: "Already checked in today",
        alreadyCheckedIn: true,
        loginDates: userLogin.loginDates,
        today: today.toISOString() // Send today's date for debugging
      }, { status: 200 });
    }
    
    // Add today to login dates and increment coins
    userLogin.loginDates.push(today);
    await userLogin.save();
    
    // Update user's coin count
    await User.findByIdAndUpdate(
      session.user.id, 
      { $inc: { coins: 1 } }
    );
    
    // Get updated user to return current coin count
    const updatedUser = await User.findById(session.user.id);
    
    return NextResponse.json({ 
      message: "Check-in successful! You earned 1 coin.",
      loginDates: userLogin.loginDates,
      coins: updatedUser.coins,
      checkedInToday: true,
      today: today.toISOString() // Send today's date for debugging
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing check-in:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 