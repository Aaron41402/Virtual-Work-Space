import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { type, data } = await request.json();
    
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
    
    if (type === 'analysis') {
      finalPrompt = createAnalysisPrompt(data);
    } else {
      finalPrompt = createContextPrompt(data);
    }
    
    // Get response from Gemini
    const result = await model.generateContent(finalPrompt);
    const response = result.response.text();
    
    // Extract efficiency score if it's an analysis
    let efficiencyScore = null;
    let tasksCompleted = 0;
    
    if (type === 'analysis') {
      // Extract efficiency score from response
      const scoreMatch = response.match(/efficiency score.*?(\d+)/i);
      efficiencyScore = scoreMatch ? parseInt(scoreMatch[1]) : 5; // Default to 5 if no score found
      
      // Count completed tasks from yesterday
      const yesterdayTasks = data.tasks.filter(task => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
        const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));
        const updatedAt = new Date(task.updatedAt);
        return updatedAt >= yesterdayStart && 
               updatedAt <= yesterdayEnd && 
               task.status === "Completed";
      });
      tasksCompleted = yesterdayTasks.length;
    }

    return new Response(JSON.stringify({ 
      response,
      efficiencyScore,
      tasksCompleted
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Create context-aware prompt for general questions
function createContextPrompt(userPrompt) {
  return `
    You are a helpful RPG-themed AI assistant named Emi. You speak in a friendly, encouraging tone with occasional RPG references.
    
    User's question or request: "${userPrompt}"
    
    If the user is asking about their efficiency or productivity, provide general advice.
    If they're asking for suggestions to improve, provide specific, actionable advice.
    For general questions, provide helpful, informative responses.
    Keep your response concise (under 100 words) and maintain the RPG theme.
  `;
}

// Create analysis prompt for efficiency analysis
function createAnalysisPrompt(data) {
  const { tasks, schedule } = data;
  
  // Get yesterday's date in local timezone
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    0, 0, 0
  );
  const yesterdayEnd = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    23, 59, 59
  );

  // Filter tasks updated yesterday
  const yesterdayTasks = tasks.filter(task => {
    const updatedAt = new Date(task.updatedAt);
    return updatedAt >= yesterdayStart && updatedAt <= yesterdayEnd;
  });

  // Separate completed and in-progress tasks
  const completedTasks = yesterdayTasks.filter(task => task.status === "Completed");
  const inProgressTasks = yesterdayTasks.filter(task => task.status === "In Progress");

  // Sort today's schedule by time
  const todaySchedule = schedule ? schedule.sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  }) : [];

  return `
    Analyze this user's productivity and efficiency for yesterday, and provide guidance for today's schedule:

    Yesterday's Performance:
    Completed tasks:
    ${completedTasks.map(task => 
      `- ${task.title} (Priority: ${task.priority}, Completed at: ${new Date(task.updatedAt).toLocaleTimeString()})`
    ).join('\n')}
    
    Tasks in progress:
    ${inProgressTasks.map(task => 
      `- ${task.title} (Priority: ${task.priority}, Last updated: ${new Date(task.updatedAt).toLocaleTimeString()})`
    ).join('\n')}
    
    Today's Schedule:
    ${todaySchedule.map(event => 
      `- ${event.time} - ${event.activity}`
    ).join('\n')}
    
    Summary:
    - Tasks completed yesterday: ${completedTasks.length}
    - Tasks in progress: ${inProgressTasks.length}
    - Activities scheduled for today: ${todaySchedule.length}

    Provide:
    1. Start with a brief, enthusiastic greeting in RPG-style to address the user as an adventurer beginning their journey for the day.

    2. **Efficiency Score: XX/100**
      - Provide an efficiency score (0-100) based on yesterday's productivity.
      - 2-3 sentences about what they did well yesterday and areas for improvement.

    3. **Guidance for Today's Quest:**
      - Provide 1-2 specific, actionable suggestions for today's schedule.  
      - Consider how to align tasks with the user's energy levels and scheduled events.  
      - Factor in potential breaks and optimal times to tackle unfinished tasks.

    Your response should be in RPG terms and be concise, positive, and encouraging. You should also treat the user like they're on a quest to improve productivity.
    
    Note: If no tasks were worked on yesterday, focus on motivation and getting started.
    Consider task priorities and how to best integrate them with today's schedule.
  `;
}
