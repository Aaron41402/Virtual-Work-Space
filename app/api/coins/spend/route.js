import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    const body = await req.json();
    const { amount, item } = body;
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    
    // Get current user
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if user has enough coins
    if (user.coins < amount) {
      return NextResponse.json({ 
        error: "Not enough coins", 
        currentBalance: user.coins 
      }, { status: 400 });
    }
    
    // Update user's coin balance
    user.coins -= amount;
    await user.save();
    
    // In a production app, you might want to log this transaction
    console.log(`User ${user._id} spent ${amount} coins on ${item}`);
    
    return NextResponse.json({ 
      message: "Purchase successful",
      newBalance: user.coins,
      spent: amount,
      item: item
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing coin spend:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 