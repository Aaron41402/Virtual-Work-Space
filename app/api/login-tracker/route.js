import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import UserLogin from "@/models/UserLogin";
import { NextResponse } from "next/server";

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

    return NextResponse.json(
      {
        loginDates: userLogin.loginDates,
        coins: user?.coins || 0
      },
      { status: 200 }
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
    today.setHours(0, 0, 0, 0);

    // Find or create user login record
    let userLogin = await UserLogin.findOne({ userId: session.user.id });

    if (!userLogin) {
      userLogin = new UserLogin({
        userId: session.user.id,
        loginDates: [],
        coins: 0
      });
    }

    // Check if user already logged in today
    const alreadyLoggedInToday = userLogin.loginDates.some((date) => {
      const loginDate = new Date(date);
      loginDate.setHours(0, 0, 0, 0);
      return loginDate.getTime() === today.getTime();
    });

    if (alreadyLoggedInToday) {
      return NextResponse.json(
        {
          message: "Already checked in today",
          alreadyCheckedIn: true,
          loginDates: userLogin.loginDates,
          coins: (await User.findById(session.user.id))?.coins || 0
        },
        { status: 200 }
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
        checkedInToday: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing check-in:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}