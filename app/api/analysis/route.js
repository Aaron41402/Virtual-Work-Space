import { auth } from "@/auth";
import connectMongo from "@/libs/mongoose";
import Analysis from "@/models/Analysis";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Get the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all analyses for the last 30 days
    const analyses = await Analysis.find({
      userId: session.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const { duration } = await req.json();

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if analysis already exists for today and duration
    const existingAnalysis = await Analysis.findOne({
      userId: session.user.id,
      date: today,
      duration
    });

    if (existingAnalysis) {
      return NextResponse.json({ analysis: existingAnalysis }, { status: 200 });
    }

    // Get tasks based on duration
    const startDate = new Date(today);
    if (duration === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (duration === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const tasks = await Task.find({
      userId: session.user.id,
      createdAt: { $gte: startDate }
    });

    // Calculate task statistics
    const taskStats = tasks.reduce((acc, task) => {
      acc.taskBreakdown[task.status.toLowerCase()]++;
      acc.priorityBreakdown[task.priority.toLowerCase()]++;
      return acc;
    }, {
      taskBreakdown: { completed: 0, inProgress: 0, pending: 0 },
      priorityBreakdown: { high: 0, medium: 0, low: 0 }
    });

    // Get AI analysis using the Gemini API
    const aiResponse = await fetch(`${process.env.APP_URL}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: {
          tasks,
          taskStats,
          duration
        },
        type: 'analysis'
      })
    });

    const aiData = await aiResponse.json();

    // Create new analysis
    const newAnalysis = new Analysis({
      userId: session.user.id,
      date: today,
      duration,
      efficiencyScore: aiData.efficiencyScore,
      tasksCompleted: taskStats.taskBreakdown.completed,
      analysis: aiData.response,
      taskBreakdown: taskStats.taskBreakdown,
      priorityBreakdown: taskStats.priorityBreakdown
    });

    await newAnalysis.save();
    return NextResponse.json({ analysis: newAnalysis }, { status: 201 });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API key not configured' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    let finalPrompt;
    
    finalPrompt = createAnalysisPrompt(prompt);
    
    // Get response from Gemini
    const result = await model.generateContent(finalPrompt);
    const response = result.response.text();
    
    let efficiencyScore = null;
    const scoreMatch = response.match(/efficiency score.*?(\d+)/i);
    efficiencyScore = scoreMatch ? parseInt(scoreMatch[1]) : null;
    
    return new Response(JSON.stringify({ 
      response,
      efficiencyScore
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process request' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Create analysis prompt for efficiency analysis
function createAnalysisPrompt(data) {
  const { schedule, tasks, duration } = data;
  
  return `
    Analyze this user's productivity and efficiency for thr duration of ${duration}:
    
    Schedule:
    ${schedule.map(item => `- ${item.time}: ${item.activity} (${item.type})`).join('\n')}
    
    Completed tasks:
    ${tasks.map(task => `- ${task.text} (completed at ${task.completedAt})`).join('\n')}
    
    Provide:
    1. An efficiency score (0-100)
    2. What they're doing well
    3. Areas for improvement
    4. 2-3 specific suggestions
    
    Format your response in RPG terms, like they're on a quest to improve productivity.
    Keep it encouraging and positive.
  `;
}