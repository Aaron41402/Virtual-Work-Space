import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { prompt, type } = await request.json();
    
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
      // Create analysis prompt
      finalPrompt = createAnalysisPrompt(prompt);
    } else {
      // Create context-aware prompt for general questions
      finalPrompt = createContextPrompt(prompt);
    }
    
    // Get response from Gemini
    const result = await model.generateContent(finalPrompt);
    const response = result.response.text();
    
    // Extract efficiency score if it's an analysis
    let efficiencyScore = null;
    if (type === 'analysis') {
      const scoreMatch = response.match(/efficiency score.*?(\d+)/i);
      efficiencyScore = scoreMatch ? parseInt(scoreMatch[1]) : null;
    }
    
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

// Create context-aware prompt for general questions
function createContextPrompt(userPrompt) {
  return `
    You are a helpful RPG-themed AI assistant named Emi. You speak in a friendly, encouraging tone with occasional RPG references.
    
    User's question or request: "${userPrompt}"
    
    If the user is asking about their efficiency or productivity, provide general advice.
    If they're asking for suggestions to improve, provide specific, actionable advice.
    For general questions, provide helpful, informative responses.
    Keep your response concise (under 150 words) and maintain the RPG theme.
  `;
}

// Create analysis prompt for efficiency analysis
function createAnalysisPrompt(data) {
  const { schedule, tasks } = data;
  
  return `
    Analyze this user's productivity and efficiency:
    
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
