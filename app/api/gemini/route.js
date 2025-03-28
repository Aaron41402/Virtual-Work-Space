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
    } else if (type === 'schedule') {
      finalPrompt = createSchedulePrompt(data);
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
    } else if (type === 'schedule') {
      // Clean up the schedule response by removing markdown code block formatting
      const cleanResponse = response.replace(/^```json\n|\n```$/g, '').trim();
      return new Response(JSON.stringify({ 
        response: cleanResponse
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
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

function createSchedulePrompt(data) {
  const { setupData, tasks } = data;
  
  // Filter only pending and in-progress tasks
  const activeTasks = tasks.filter(task => 
    task.status === "Pending" || task.status === "In Progress"
  );

  return `
    As an AI schedule generator, create a daily schedule based on the user's preferences and tasks.
    Use the following setup data and active tasks to generate an optimized hourly schedule.

    User Setup Data:
    ${JSON.stringify(setupData, null, 2)}

    Active Tasks:
    ${activeTasks.map(task => 
      `- ${task.title} (Priority: ${task.priority}, Status: ${task.status}, Description: ${task.description})`
    ).join('\n')}

    Requirements:
    1. Generate a schedule that follows this exact JSON format:
    [{"id":"hour","time":"HH:00","endTime":"HH:00","activity":"Activity Name","type":"routine/priority/habit"}]
    - Note that endTime is optional, and should ONLY exist if the activity is only more than one hour long.

    2. Setup Data Usage:
    - All hours after bed time and before wake up time should be set to sleep
    - If there are habits, please analyze how many hours they take and what time of the day they should take place
    - Priorities are what matters most to the user, they could be specific tasks (e.g. work out) or vague ideas (e.g. get things done)
    - For vague priorities, please look for related habits and tasks, and prioritize putting them in the schedule
    - For specific priorities, please analyze how many hours they take and what time of the day they should take place

    3. Active Tasks Usage:
    - Carefully read the task title and description, then analyze how many hours they take and what time of the day they should take place
    - Assign high priority and in progress tasks first
    - No need to assign all tasks

    3. Other Rules:
    - Use 24-hour format for time (HH:MM)
    - Start from 00:00 to 23:00, only hours, so 00:00, 01:00, 02:00, 03:00, ..., 22:00, 23:00.
    - Give the user some free time throughout the day, ideally every 2-4 hours, or after meals time-consuming tasks
    - Do not include free time in the list, leave that hour out. For example [..., {"id":"09","time":"09:00","activity":"Lunch","type":"priority"},{"id":"11","time":"11:00","activity":"Project","type":"priority"},...]
    - Assign appropriate meal times depending on the wake up time and bed time, normally 2 or 3 meals a day, each meal time should only take an hour, meals should be "routine" type
    - Each activity should have a unique ID
    - Valid types are: "routine", "priority", "habit"
    - Use hour for id 

    Return ONLY the JSON array with no additional text or explanation.
    The response must be parseable by JSON.parse().
  `;
}
