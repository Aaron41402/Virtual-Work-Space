import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { type, data } = await request.json();
    
    // Log the request for debugging
    console.log(`Processing ${type} request with data:`, typeof data === 'string' ? data : 'complex data');
    
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
    let result;
    
    if (type === 'analysis') {
      finalPrompt = createAnalysisPrompt(data);
    } else if (type === 'context') {
      // Make sure we're handling context requests correctly
      finalPrompt = createContextPrompt(data);
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid request type' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get response from Gemini
    try {
      result = await model.generateContent(finalPrompt);
    } catch (error) {
      console.error('Gemini API error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate content',
        details: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
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

// Improve the context prompt function
function createContextPrompt(userPrompt) {
  return `
    You are a helpful RPG-themed AI assistant named Emi. You speak in a friendly, encouraging tone with occasional RPG references.
    
    User's question or request: "${userPrompt}"
    
    If the user is asking about their efficiency or productivity, provide general advice.
    If they're asking for suggestions to improve, provide specific, actionable advice.
    For general questions, provide helpful, informative responses.
    Keep your response concise (under 40 words) and maintain the RPG theme.
    
    Always respond as if you're a character in an RPG game, using terms like quests (tasks), 
    adventure (day), skills (abilities), and other fantasy RPG terminology.
    
    If the user asks something you don't know, admit that you don't have that information
    rather than making up an answer.
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
    1. An efficiency score for yesterday (0-100)
    2. What they did well yesterday
    3. Areas for improvement
    4. 2-3 specific suggestions for today's schedule, considering:
       - The timing and nature of scheduled activities
       - Potential breaks between activities
       - Best times to tackle incomplete tasks
    
    Format your response in RPG terms, like they're on a quest to improve productivity.
    Keep it encouraging and positive.
    
    Note: If no tasks were worked on yesterday, focus on motivation and getting started.
    Consider task priorities and how to best integrate them with today's schedule.
  `;
}
