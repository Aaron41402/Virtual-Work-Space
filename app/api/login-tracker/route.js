import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import UserLogin from "@/models/UserLogin";
import { NextResponse } from "next/server";

// Helper function for date comparison
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Get login history for the current user
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Find or create user login record
    let userLogin = await UserLogin.findOne({ userId: session.user.id });

    if (!userLogin) {
      userLogin = new UserLogin({
        userId: session.user.id,
        loginDates: [],
        coins: 0
      });
      await userLogin.save();
    }

    // Get user to include total coins
    const user = await User.findById(session.user.id);

    // Check if user already logged in today
    const today = new Date();
    const checkedInToday = userLogin.loginDates.some((date) => 
      isSameDay(date, today)
    );

    return NextResponse.json(
      {
        loginDates: userLogin.loginDates,
        coins: user?.coins || 0,
        checkedInToday // Explicitly tell the client if they're checked in today
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Handle daily check-in
export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Get today's date in local timezone
    const today = new Date();

    // Find or create user login record
    let userLogin = await UserLogin.findOne({ userId: session.user.id });

    if (!userLogin) {
      userLogin = new UserLogin({
        userId: session.user.id,
        loginDates: [],
        coins: 0
      });
      await userLogin.save();
    }

    // Check if user already logged in today
    const alreadyLoggedInToday = userLogin.loginDates.some((date) => 
      isSameDay(date, today)
    );

    if (alreadyLoggedInToday) {
      // Get the user to include coins
      const user = await User.findById(session.user.id);
      
      return NextResponse.json(
        {
          message: "Already checked in today",
          alreadyCheckedIn: true,
          loginDates: userLogin.loginDates,
          coins: user?.coins || 0,
          checkedInToday: true // Explicitly tell the client they're checked in today
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      );
    }

    // Add today to login dates and increment coins
    userLogin.loginDates.push(today);
    await userLogin.save();

    // Update user's coin count
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { coins: 1 } },
      { new: true } // Return the updated document
    );

    return NextResponse.json(
      {
        message: "Check-in successful! You earned 1 coin.",
        loginDates: userLogin.loginDates,
        coins: updatedUser.coins,
        checkedInToday: true // Explicitly tell the client they're checked in today
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error("Error processing check-in:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}