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
      const tasksData = localStorage.getItem('tasks');
      const tasks = tasksData ? JSON.parse(tasksData) : [];
      
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
      addBotMessage(data.response.replaceAll("*", ""));
      
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
      // Get task and schedule data
      let tasksData = localStorage.getItem('tasks');
      let scheduleData = localStorage.getItem('scheduleData');
      
      if (!tasksData) {
        addBotMessage("I don't have enough data to analyze your efficiency yet. Complete some quests and check back later!");
        setIsAnalyzing(false);
        setIsTyping(false);
        return;
      }
      
      const tasks = tasksData? JSON.parse(tasksData) : [];
      const schedule = scheduleData ? JSON.parse(scheduleData) : [];
      
      // Call the API route
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'analysis',
          data: { tasks, schedule }
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      setUserEfficiency(data.efficiencyScore);
      addBotMessage(data.response.replaceAll("*", ""));
    } catch (error) {
      console.error('Error analyzing efficiency:', error);
      addBotMessage("I encountered a magical barrier while trying to analyze your efficiency. Please try again later!");
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Make sure we're sending the correct request format
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'context', // Ensure this is 'context' for general questions
          data: messageToSend // Send the user's message as data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API returned error:', data.error);
        addBotMessage("I'm having trouble processing your request. Please try again later!");
      } else {
        // Make sure we're using the correct property from the response
        addBotMessage(data.response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      addBotMessage("I'm having trouble connecting right now. Please try again later!");
    } finally {
      setIsTyping(false);
    }
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
        "\nTIP: Review your quest log at the end of the day to prepare for tomorrow's adventure."
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

  // Remove the quick action buttons and add a reminder system
  useEffect(() => {
    // Set up periodic reminders when the chat is open
    let reminderInterval;
    
    if (isOpen) {
      // Clear any existing interval
      if (reminderInterval) clearInterval(reminderInterval);
      
      // Set up a new interval for reminders (every 3-5 minutes)
      reminderInterval = setInterval(() => {
        // Only show reminders if the user hasn't interacted recently
        const lastMessageTime = messages.length > 0 
          ? new Date(messages[messages.length - 1].timestamp || Date.now()) 
          : new Date(0);
        
        const timeSinceLastMessage = Date.now() - lastMessageTime;
        const threeMinutes = 3 * 60 * 1000;
        
        if (timeSinceLastMessage > threeMinutes) {
          generateReminder();
        }
      }, 4 * 60 * 1000); // Check every 4 minutes
    }
    
    return () => {
      if (reminderInterval) clearInterval(reminderInterval);
    };
  }, [isOpen, messages]);

  // Function to generate contextual reminders and encouragements
  const generateReminder = async () => {
    try {
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      
      // Decide whether to show an encouragement message (30% chance)
      const showEncouragement = Math.random() < 0.3;
      
      if (showEncouragement) {
        // Generate an encouragement message
        const encouragementMessages = [
          "⚔️ Your persistence is legendary! Each task you complete adds to your hero's tale.",
          "🌟 You're making excellent progress on your journey! Your determination would impress even the greatest wizards.",
          "🛡️ Remember: even the mightiest heroes take small steps. Your consistent effort is building something amazing!",
          "🧙‍♂️ I sense great power in your work today! Your focus and dedication are truly magical.",
          "🏆 Every quest completed brings you closer to legendary status! I'm impressed by your progress.",
          "🔮 The oracle foretold of a hero with your dedication. The prophecy is coming true!",
          "🏰 You're building your kingdom one task at a time. Your strategic approach is admirable!",
          "🧝‍♀️ Even the elven elders would be impressed by how you've managed your quests today.",
          "🐉 You're slaying your tasks like a true dragon hunter! Your courage in facing challenges is inspiring.",
          "🏆 Your work ethic is as rare and valuable as enchanted gems. Keep mining for greatness!"
        ];
        
        // Select a random encouragement message
        const encouragementMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        
        // Add the encouragement as a bot message
        addBotMessage(encouragementMessage);
        
        // Set happy expression for encouragement
        setAvatarExpression('happy');
        
        // Reset expression after a few seconds
        setTimeout(() => {
          setAvatarExpression('nice');
        }, 5000);
        
        return; // Exit the function after showing encouragement
      }
      
      // Continue with regular reminders if not showing encouragement
      // Get task and schedule data
      let tasksData = localStorage.getItem('tasks');
      let scheduleData = localStorage.getItem('scheduleData');
      
      const tasks = tasksData ? JSON.parse(tasksData) : [];
      const schedule = scheduleData ? JSON.parse(scheduleData) : [];
      
      // Find upcoming schedule items
      const upcomingItems = schedule.filter(item => {
        const itemHour = parseInt(item.time.split(':')[0]);
        const itemMinute = parseInt(item.time.split(':')[1]);
        
        // Check if the item is within the next 30 minutes
        if (itemHour === currentHour) {
          return (itemMinute - now.getMinutes()) <= 30 && (itemMinute - now.getMinutes()) > 0;
        } else if (itemHour === currentHour + 1) {
          return (itemMinute + 60 - now.getMinutes()) <= 30;
        }
        return false;
      });
      
      // Find pending high priority tasks
      const highPriorityTasks = tasks.filter(task => 
        task.priority === 'High' && task.status === 'Pending'
      );
      
      // Determine what kind of reminder to show
      let reminderType = 'general';
      let reminderData = null;
      
      if (upcomingItems.length > 0) {
        reminderType = 'schedule';
        reminderData = upcomingItems[0]; // Remind about the nearest upcoming item
      } else if (highPriorityTasks.length > 0) {
        reminderType = 'task';
        reminderData = highPriorityTasks[0]; // Remind about a high priority task
      }
      
      // Generate the reminder message
      let reminderMessage = '';
      
      switch (reminderType) {
        case 'schedule':
          reminderMessage = `⏰ Brave adventurer! Don't forget your upcoming quest: "${reminderData.activity}" at ${reminderData.time}. Prepare yourself!`;
          break;
        case 'task':
          reminderMessage = `📜 Attention, hero! You have an important quest waiting: "${reminderData.title}" with HIGH priority. The kingdom depends on you!`;
          break;
        default:
          // Time-based general reminders
          if (currentHour < 12) {
            reminderMessage = "🌞 How's your morning adventure going? Remember to tackle your most challenging quests while your energy is high!";
          } else if (currentHour < 15) {
            reminderMessage = "🍽️ Have you taken a break to restore your energy? Even the mightiest heroes need to rest!";
          } else if (currentHour < 18) {
            reminderMessage = "🌆 The day's journey continues! What quests remain on your adventure log for today?";
          } else {
            reminderMessage = "🌙 The day's light fades. Consider reviewing your completed quests and planning tomorrow's adventure!";
          }
      }
      
      // Add the reminder as a bot message
      addBotMessage(reminderMessage);
      
      // Change avatar expression based on reminder type
      if (reminderType === 'schedule') {
        setAvatarExpression('impressed');
      } else if (reminderType === 'task') {
        setAvatarExpression('happy');
      } else {
        setAvatarExpression('nice');
      }
      
      // Reset expression after a few seconds
      setTimeout(() => {
        setAvatarExpression('nice');
      }, 5000);
      
    } catch (error) {
      console.error('Error generating reminder:', error);
    }
  };

  // Add this near the top of your component
  const inputStyle = {
    color: "#333333",
    backgroundColor: "#ffffff",
    border: "1px solid #cccccc"
  };

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
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-80 bg-[#422e37] rounded-none border-4 border-[#e9d8a6] shadow-lg overflow-hidden z-50 pixel-border">
          <div className="flex flex-col h-96">
            {/* Chat Header */}
            <div className="bg-[#705e78] p-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-none overflow-hidden mr-2">
                  <img 
                    src={`/woman_${avatarExpression}.png`} 
                    alt="Assistant" 
                    className="w-full h-full object-cover"
                    style={{imageRendering: 'pixelated'}}
                  />
                </div>
                <h3 className="text-[#f2e9e4] text-sm font-bold">EMI</h3>
              </div>
              <div className="flex space-x-2">
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[#f2e9e4] hover:text-[#e9d8a6]"
                >
                  <X size={16} />
                </button>
              </div>
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
            <form onSubmit={handleSendMessage} className="p-3 flex items-center bg-[#422e37] border-t-2 border-[#705e78]">
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="TYPE MESSAGE..."
                className="flex-1 rounded-none px-3 py-2 text-xs pixel-input min-w-0 h-10"
                style={inputStyle}
              />
              <button 
                type="submit"
                className="px-3 py-2 ml-2 rounded-none text-[#f2e9e4] bg-[#705e78] hover:bg-[#9c89b8] pixel-button flex-shrink-0 h-10 flex items-center justify-center"
                disabled={!inputMessage.trim()}
              >
                <Send size={16} />
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
