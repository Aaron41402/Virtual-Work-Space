import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import Task from "@/models/Task";
import { NextResponse } from "next/server";

// Create a new task
export async function POST(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const body = await req.json();

    const newTask = new Task({
      userId: session.user.id,
      ...body,
    });

    await newTask.save();
    return NextResponse.json({ 
      message: "Task created successfully",
      task: newTask 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Get all tasks for the logged-in user
export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const tasks = await Task.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Update a task
export async function PUT(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const body = await req.json();
    const { id, ...updateData } = body;

    // Verify task ownership
    const task = await Task.findOne({ _id: id, userId: session.user.id });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ 
      message: "Task updated successfully",
      task: updatedTask 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Verify task ownership
    const task = await Task.findOne({ _id: id, userId: session.user.id });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ 
      message: "Task deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
