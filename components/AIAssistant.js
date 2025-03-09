'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send, X, Minimize2, Calendar, BookOpen, Clock, Coffee, Activity } from 'lucide-react'

export default function AIAssistant() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userEfficiency, setUserEfficiency] = useState(null);
  const [avatarExpression, setAvatarExpression] = useState('nice'); // Default expression

  // Add pixel art styles
  useEffect(() => {
    // Add pixel art font and animations to the document
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      
      .font-pixel {
        font-family: 'Press Start 2P', cursive;
      }
      
      .pixel-shadow {
        box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.4);
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes pixel-fade-in {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-pulse-slow {
        animation: pulse 2s ease-in-out infinite;
      }
      
      .animate-pixel-fade-in {
        animation: pixel-fade-in 0.3s ease-out forwards;
      }
      
      .pixel-border {
        border-style: solid;
        border-width: 4px;
        border-image: url("data:image/svg+xml,%3Csvg width='3' height='3' viewBox='0 0 3 3' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0H3V3H0V0Z' fill='%23422e37'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1 1H2V2H1V1Z' fill='%23e9d8a6'/%3E%3C/svg%3E")
        9 stretch;
      }
      
      .pixel-button {
        image-rendering: pixelated;
        background-color: #705e78;
        color: #f2e9e4;
        border: 0;
        box-shadow: 
          0 4px 0 0 #422e37,
          inset -4px -4px 0 0 #422e37,
          inset 4px 4px 0 0 #9c89b8;
      }
      
      .pixel-button:hover {
        background-color: #9c89b8;
      }
      
      .pixel-button:active {
        transform: translateY(4px);
        box-shadow: 
          0 0px 0 0 #422e37,
          inset -4px -4px 0 0 #422e37,
          inset 4px 4px 0 0 #9c89b8;
      }
      
      .pixel-input {
        background-color: #f2e9e4;
        color: #422e37;
        border: 0;
        box-shadow: 
          inset 4px 4px 0 0 #422e37,
          inset -4px -4px 0 0 #9c89b8;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Welcome messages based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    // Get username from session email (before @ symbol) if name is not available
    const userName = session?.user?.name || 
                    (session?.user?.email ? session.user.email.split('@')[0] : 'brave adventurer');
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${userName}! Ready for today's quests?`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${userName}! How goes your adventure today?`;
    } else if (hour >= 17 && hour < 22) {
      return `Good evening, ${userName}! Time to complete your final quests for the day?`;
    } else {
      return `Hello ${userName}! Burning the midnight oil? Don't forget to rest and restore your energy!`;
    }
  };

  // RPG-themed encouraging messages
  const encouragingMessages = [
    "Your FOCUS stat increased! Keep up the great work, brave adventurer! 🌟",
    "Time for a quick REST to restore your energy points! Stand up and stretch! 💪",
    "Don't forget to refill your HYDRATION meter! Grab a potion (water)! 💧",
    "You've gained +5 CONFIDENCE! This challenge is no match for you! 🚀",
    "Cast SELF-CARE spell! Take a moment to breathe deeply. 🧘",
    "Your PERSEVERANCE skill is leveling up! Keep going! 🌈",
    "Each small quest completed brings you closer to the legendary achievement! 👣",
    "Your character is gaining EXP even when progress feels slow! 🌱",
    "Remember your MAIN QUEST motivation! Stay on your path! 💭",
    "You've unlocked the POTENTIAL ability! Use it wisely! 💫"
  ];

  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Focus input when chat is opened
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Check if this is a new session to show welcome message
    if (session && !hasShownWelcome && isOpen) {
      const welcomeMessage = getWelcomeMessage();
      
      // Add welcome message with a slight delay
      setTimeout(() => {
        addBotMessage(welcomeMessage);
        setHasShownWelcome(true);
      }, 1000);
    }
  }, [session, isOpen, hasShownWelcome]);

  // Add this function to determine the appropriate expression based on message content
  const determineExpression = (message) => {
    const text = message.toLowerCase();
    
    // Detect emotions from text content
    if (text.includes('congratulations') || text.includes('great job') || 
        text.includes('well done') || text.includes('amazing') || 
        text.includes('excellent') || text.includes('perfect')) {
      return 'happy';
    }
    
    if (text.includes('impressive') || text.includes('wow') || 
        text.includes('incredible') || text.includes('outstanding') ||
        text.includes('remarkable')) {
      return 'impressed';
    }
    
    if (text.includes('warning') || text.includes('careful') || 
        text.includes('danger') || text.includes('error') ||
        text.includes('failed') || text.includes('limit')) {
      return 'angry';
    }
    
    // Default to nice expression
    return 'nice';
  };

  // Update the addBotMessage function to set avatar expression
  const addBotMessage = (text) => {
    setIsTyping(true);
    
    // Determine expression based on message content
    const expression = determineExpression(text);
    setAvatarExpression(expression);
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(1000, Math.max(500, text.length * 10));
    
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text }]);
      setIsTyping(false);
      
      // Reset expression to default after a delay
      setTimeout(() => {
        setAvatarExpression('nice');
      }, 5000);
    }, typingDelay);
  };

  const askGemini = async (prompt) => {
    setIsTyping(true);
    
    try {
      // Get schedule data
      const scheduleData = localStorage.getItem('scheduleData');
      const schedule = scheduleData ? JSON.parse(scheduleData) : [];
      
      // Get completed tasks
      const completedTasks = localStorage.getItem('completedTasks');
      const tasks = completedTasks ? JSON.parse(completedTasks) : [];
      
      // Call the API route
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          type: 'general',
          context: {
            schedule,
            tasks,
            currentDate: new Date().toLocaleDateString(),
            currentTime: new Date().toLocaleTimeString()
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          addBotMessage(`🛡️ ${data.error || "You've reached your limit of AI queries. Please wait a moment before trying again."}`);
          
          // If we have a reset time, tell the user when they can try again
          if (data.rateLimitReset) {
            const resetTime = new Date(data.rateLimitReset);
            const minutes = Math.ceil((resetTime - new Date()) / 60000);
            addBotMessage(`You can try again in about ${minutes} minute${minutes !== 1 ? 's' : ''}.`);
          }
        } else {
          throw new Error(data.error || 'API request failed');
        }
        return;
      }
      
      // Add the response to chat
      addBotMessage(data.response);
      
      // Optionally show remaining requests
      if (data.remainingRequests !== undefined && data.remainingRequests <= 2) {
        addBotMessage(`⚠️ You have ${data.remainingRequests} AI queries remaining. Use them wisely!`);
      }
    } catch (error) {
      console.error('Error with Gemini API:', error);
      addBotMessage("I'm having trouble connecting to my knowledge base. Please try again later.");
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeUserEfficiency = async () => {
    setIsAnalyzing(true);
    setIsTyping(true);
    
    try {
      // Get schedule and task data
      const scheduleData = localStorage.getItem('scheduleData');
      const completedTasks = localStorage.getItem('completedTasks');
      
      if (!scheduleData || !completedTasks) {
        addBotMessage("I don't have enough data to analyze your efficiency yet. Complete some quests and check back later!");
        setIsAnalyzing(false);
        setIsTyping(false);
        return;
      }
      
      const schedule = JSON.parse(scheduleData);
      const tasks = JSON.parse(completedTasks);
      
      // Call the API route
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: { schedule, tasks },
          type: 'analysis'
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      setUserEfficiency(data.efficiencyScore);
      addBotMessage(data.response);
    } catch (error) {
      console.error('Error analyzing efficiency:', error);
      addBotMessage("I encountered a magical barrier while trying to analyze your efficiency. Please try again later!");
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: inputMessage.trim() }]);
    
    // Store the message for processing
    const userMsg = inputMessage.trim().toLowerCase();
    
    // Clear input
    setInputMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process message after a short delay
    setTimeout(() => {
      // Check for specific commands
      if (userMsg.includes('analyze my efficiency') || userMsg.includes('how productive am i')) {
        analyzeUserEfficiency();
      }
      // For all other messages, use Gemini
      else {
        askGemini(userMsg);
      }
    }, 1000);
  };

  // Show notification bubble
  const showNotificationBubble = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 10000);
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Only add welcome message if opening chat AND no messages exist yet
    if (!isOpen && messages.length === 0 && !hasShownWelcome) {
      addBotMessage(getWelcomeMessage());
      setHasShownWelcome(true);
    }
  };

  // Dismiss notification
  const dismissNotification = () => {
    setShowNotification(false);
  };

  // Show random encouragement
  const showRandomEncouragement = () => {
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    const message = encouragingMessages[randomIndex];
    
    if (isOpen) {
      // If chat is open, add as a message
      addBotMessage(message);
    } else {
      // Otherwise show as notification
      showNotificationBubble(message);
    }
  };

  // Check schedule for upcoming events
  const checkSchedule = () => {
    try {
      // Get schedule data from localStorage
      const scheduleData = localStorage.getItem('scheduleData');
      if (!scheduleData) return;
      
      const schedule = JSON.parse(scheduleData);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Find upcoming events in the next hour
      const upcomingEvents = schedule.filter(event => {
        const [eventHour, eventMinute] = event.time.split(':').map(Number);
        
        // Check if event is within the next 15 minutes
        if (eventHour === currentHour) {
          return eventMinute > currentMinute && eventMinute - currentMinute <= 15;
        } else if (eventHour === currentHour + 1) {
          return eventMinute + (60 - currentMinute) <= 15;
        }
        return false;
      });
      
      // Notify about upcoming events
      if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0];
        const message = `⚔️ QUEST ALERT: "${nextEvent.activity}" begins at ${nextEvent.time}! Prepare yourself, adventurer!`;
        showNotificationBubble(message);
        
        // Add suggestions based on event type
        setTimeout(() => {
          const activity = nextEvent.activity.toLowerCase();
          
          if (activity.includes('meeting') || activity.includes('call')) {
            showNotificationBubble("📜 PREPARATION TIP: Gather your notes and prepare key points before your meeting. A prepared adventurer is a successful one!");
          } else if (activity.includes('study') || activity.includes('learn')) {
            showNotificationBubble("📚 STUDY TIP: Find a quiet location and remove distractions to maximize your FOCUS stat during your study quest!");
          } else if (activity.includes('exercise') || activity.includes('workout')) {
            showNotificationBubble("💪 TRAINING TIP: Remember to hydrate before your workout to increase your STAMINA stat by +15%!");
          } else if (activity.includes('write') || activity.includes('report')) {
            showNotificationBubble("✍️ WRITING TIP: Start with an outline to organize your thoughts and boost your CLARITY stat!");
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking schedule:', error);
    }
  };

  // Show schedule information
  const showSchedule = () => {
    try {
      // Get schedule data from localStorage
      const scheduleData = localStorage.getItem('scheduleData');
      
      if (!scheduleData) {
        addBotMessage("I don't see any quests in your journey log! You can create a schedule in the Home section. Would you like some tips on effective quest planning?");
        return;
      }
      
      const schedule = JSON.parse(scheduleData);
      const now = new Date();
      const currentHour = now.getHours();
      
      // Filter for upcoming events today
      const upcomingEvents = schedule.filter(event => {
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour >= currentHour;
      }).slice(0, 3); // Show next 3 events
      
      if (upcomingEvents.length === 0) {
        addBotMessage("You have completed all your quests for today! Rest well, brave adventurer, for tomorrow brings new challenges!");
        return;
      }
      
      let response = "Your upcoming quests:\n\n";
      upcomingEvents.forEach(event => {
        response += `• ${event.time} - ${event.activity}\n`;
      });
      
      // Add a random RPG-themed tip
      const tips = [
        "\nTIP: Prepare for your next quest 5-10 minutes early to boost your READINESS stat.",
        "\nTIP: Take a short rest between quests to restore your FOCUS points.",
        "\nTIP: Staying hydrated throughout your journey increases your STAMINA by +20%.",
        "\nTIP: If you're feeling overwhelmed, use the DEEP BREATHING spell for 1 minute before your next quest.",
        "\nTIP: Review your quest log at the end of the day to prepare for tomorrow's adventures."
      ];
      
      response += tips[Math.floor(Math.random() * tips.length)];
      
      addBotMessage(response);
    } catch (error) {
      console.error('Error showing schedule:', error);
      addBotMessage("I seem to have misplaced my quest scroll. Please try again later!");
    }
  };

  // Add this useEffect to check schedule periodically
  useEffect(() => {
    // Check schedule every 5 minutes
    const scheduleInterval = setInterval(() => {
      checkSchedule();
    }, 300000); // 5 minutes
    
    // Initial check after component mounts
    const initialCheck = setTimeout(() => {
      checkSchedule();
    }, 10000); // Check 10 seconds after mounting
    
    // Clean up intervals on unmount
    return () => {
      clearInterval(scheduleInterval);
      clearTimeout(initialCheck);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-pixel">
      {/* Notification Bubble */}
      {showNotification && !isOpen && (
        <div className="mb-4 bg-gray-900/90 text-white p-4 rounded-none shadow-lg max-w-xs animate-pixel-fade-in relative pixel-border">
          <button 
            onClick={dismissNotification}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
          <p className="pr-4 text-xs leading-relaxed">{notificationMessage}</p>
        </div>
      )}
      
      {/* Chat Window with Avatar on Top */}
      {isOpen && (
        <div className="relative mb-4">
          {/* Avatar on top of chat */}
          <div className="absolute -top-24 right-4 z-10">
            <div className="w-24 h-24 rounded-none overflow-hidden pixel-border animate-float">
              <img 
                src={`/woman_${avatarExpression}.png`} 
                alt="Assistant" 
                className="w-full h-full object-cover"
                style={{imageRendering: 'pixelated'}}
              />
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="bg-[#705e78] rounded-none shadow-xl w-80 md:w-96 overflow-hidden pixel-border mt-12">
            {/* Chat Header */}
            <div className="bg-[#422e37] text-[#f2e9e4] p-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium text-xs">Emi</span>
              </div>
              <button onClick={toggleChat} className="text-[#f2e9e4] hover:text-white">
                <Minimize2 size={18} />
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="bg-[#9c89b8] p-2 flex justify-around">
              <button 
                onClick={() => showSchedule()}
                className="p-2 rounded-none hover:bg-[#705e78] flex flex-col items-center text-xs pixel-button"
                title="Show Schedule"
              >
                <Calendar size={16} className="mb-1" />
                <span>QUESTS</span>
              </button>
              <button 
                onClick={() => addBotMessage("For your current task, try breaking it down into smaller steps to make it more manageable!")}
                className="p-2 rounded-none hover:bg-[#705e78] flex flex-col items-center text-xs pixel-button"
                title="Task Tips"
              >
                <BookOpen size={16} className="mb-1" />
                <span>SKILLS</span>
              </button>
              <button 
                onClick={() => addBotMessage("To boost productivity, try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.")}
                className="p-2 rounded-none hover:bg-[#705e78] flex flex-col items-center text-xs pixel-button"
                title="Productivity Tips"
              >
                <Clock size={16} className="mb-1" />
                <span>WISDOM</span>
              </button>
              <button 
                onClick={showRandomEncouragement}
                className="p-2 rounded-none hover:bg-[#705e78] flex flex-col items-center text-xs pixel-button"
                title="Get Encouragement"
              >
                <Coffee size={16} className="mb-1" />
                <span>BOOST</span>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-3 bg-[#f2e9e4]">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-2 rounded-none pixel-border ${
                      msg.sender === 'user' 
                        ? 'bg-[#9c89b8] text-[#f2e9e4]' 
                        : 'bg-[#e9d8a6] text-[#422e37]'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-[#e9d8a6] text-[#422e37] p-2 rounded-none pixel-border">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#422e37] rounded-sm animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#422e37] rounded-sm animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#422e37] rounded-sm animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 flex bg-[#422e37]">
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="TYPE MESSAGE..."
                className="flex-1 rounded-none px-3 py-2 text-xs pixel-input"
              />
              <button 
                type="submit"
                className="px-4 py-2 rounded-none text-[#f2e9e4] pixel-button"
                disabled={!inputMessage.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Chat Button - Pixel Art Style (Bigger) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="w-20 h-20 rounded-none overflow-hidden pixel-border animate-float"
        >
          <div className="w-full h-full relative">
            <img 
              src={`/woman_${avatarExpression}.png`} 
              alt="Assistant" 
              className="w-full h-full object-cover animate-pulse-slow"
              style={{imageRendering: 'pixelated'}}
            />
            {/* Notification indicator */}
            {showNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-none pixel-border animate-pulse"></div>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
