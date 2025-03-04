'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AIAssistant() {
  const { data: session, status } = useSession();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'schedule' or 'encouragement'
  const [isExiting, setIsExiting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [characterIndex, setCharacterIndex] = useState(0);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Welcome messages based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    // Get username from session email (before @ symbol) if name is not available
    const userName = session?.user?.name || 
                    (session?.user?.email ? session.user.email.split('@')[0] : 'brave adventurer');
    
    if (hour >= 5 && hour < 12) {
      return [
        `Good morning, ${userName}! A new day of quests awaits. May your coffee be strong and your focus stronger!`,
        `Rise and shine, ${userName}! The morning sun brings new opportunities for adventure and productivity.`,
        `Welcome to a fresh morning, ${userName}! What epic tasks shall we conquer before noon?`
      ];
    } else if (hour >= 12 && hour < 17) {
      return [
        `Good afternoon, ${userName}! How goes your quest today? There's still time to accomplish great things!`,
        `The day is at its peak, ${userName}! Let's harness this energy to tackle your most important tasks.`,
        `Greetings, ${userName}! The afternoon sun shines upon your journey. What challenges will you overcome today?`
      ];
    } else if (hour >= 17 && hour < 22) {
      return [
        `Good evening, ${userName}! As the day winds down, let's review what you've accomplished and plan for tomorrow.`,
        `The evening brings reflection, ${userName}. What victories did you claim today? What lessons did you learn?`,
        `Welcome back, ${userName}! The evening is a perfect time to tie up loose ends and prepare for tomorrow's adventures.`
      ];
    } else {
      return [
        `Working late, ${userName}? Your dedication is admirable, but remember that rest is also part of the hero's journey.`,
        `The midnight hour approaches, ${userName}. Even the most valiant heroes need their rest to face tomorrow's challenges.`,
        `Greetings, night owl ${userName}! May your late-hour productivity be legendary, but don't forget to rest soon.`
      ];
    }
  };

  // Encouraging messages to display randomly
  const encouragingMessages = [
    "You're doing great today! Keep it up! 🌟",
    "Remember to take a short break and stretch! 💪",
    "Stay hydrated! Grab a glass of water. 💧",
    "You've got this! I believe in you! 🚀",
    "Don't forget to breathe and take a moment for yourself. 🧘",
    "Your hard work will pay off! Keep going! 🌈",
    "Every small step counts towards your goals! 👣",
    "You're making progress, even if you don't see it yet! 🌱",
    "Remember your 'why' and stay motivated! 💭",
    "You're capable of amazing things! 💫"
  ];

  // Function to check if we should show a welcome message
  const checkWelcomeMessage = () => {
    // Only show welcome message if session is loaded
    if (status === 'loading' || hasShownWelcome) return;
    
    // Check if this is a new login session
    const lastLoginTimestamp = localStorage.getItem('lastLoginTimestamp');
    const currentTimestamp = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // If no previous login or login expired (30+ minutes ago), show welcome message
    if (!lastLoginTimestamp || (currentTimestamp - parseInt(lastLoginTimestamp)) > sessionTimeout) {
      const welcomeMessages = getWelcomeMessage();
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      
      setMessage(welcomeMessages[randomIndex]);
      setMessageType('encouragement');
      setShowMessage(true);
      setIsTyping(true);
      setCharacterIndex(0);
      setDisplayedText('');
      
      // Save current timestamp as last login
      localStorage.setItem('lastLoginTimestamp', currentTimestamp.toString());
      setHasShownWelcome(true);
      
      setTimeout(() => {
        handleDismiss();
      }, 15000);
    } else {
      // Update the timestamp but don't show welcome message
      localStorage.setItem('lastLoginTimestamp', currentTimestamp.toString());
      setHasShownWelcome(true);
    }
  };

  // Function to check schedule and display reminders
  const checkSchedule = () => {
    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Get schedule data from localStorage if available
    const scheduleData = localStorage.getItem('todaySchedule');
    
    if (scheduleData) {
      try {
        const schedule = JSON.parse(scheduleData);
        
        // Check if there's an upcoming task in the next 15 minutes
        schedule.forEach(task => {
          if (task.time) {
            const [taskHours, taskMinutes] = task.time.split(':').map(Number);
            
            // Calculate time difference in minutes
            const currentTotalMinutes = hours * 60 + minutes;
            const taskTotalMinutes = taskHours * 60 + taskMinutes;
            const minutesDifference = taskTotalMinutes - currentTotalMinutes;
            
            // If task is coming up in the next 15 minutes and we're not already showing a message
            if (minutesDifference > 0 && minutesDifference <= 15 && !showMessage) {
              setMessage(`Upcoming task in ${minutesDifference} minutes: ${task.title}`);
              setMessageType('schedule');
              setShowMessage(true);
              setIsTyping(true);
              setCharacterIndex(0);
              setDisplayedText('');
              
              // Hide message after 15 seconds
              setTimeout(() => {
                handleDismiss();
              }, 15000);
            }
          }
        });
      } catch (error) {
        console.error('Error parsing schedule data:', error);
      }
    }
  };

  // Function to show random encouraging message
  const showRandomEncouragement = () => {
    if (!showMessage) {
      const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
      setMessage(encouragingMessages[randomIndex]);
      setMessageType('encouragement');
      setShowMessage(true);
      setIsTyping(true);
      setCharacterIndex(0);
      setDisplayedText('');
      
      // Hide message after 12 seconds
      setTimeout(() => {
        handleDismiss();
      }, 12000);
    }
  };

  // Handle smooth dismissal with CSS transition
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowMessage(false);
      setIsExiting(false);
    }, 300); // Match this with the CSS transition duration
  };

  // Text typing effect
  useEffect(() => {
    if (isTyping && characterIndex < message.length) {
      const typingSpeed = 30; // milliseconds per character
      const timer = setTimeout(() => {
        setDisplayedText(message.substring(0, characterIndex + 1));
        setCharacterIndex(characterIndex + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    } else if (characterIndex >= message.length) {
      setIsTyping(false);
    }
  }, [isTyping, characterIndex, message]);

  useEffect(() => {
    // Wait for session to be loaded before showing welcome message
    if (status === 'authenticated') {
      setTimeout(() => {
        checkWelcomeMessage();
      }, 1000);
    }
  }, [status]); // Re-run when session status changes

  useEffect(() => {
    // Check schedule every minute
    const scheduleInterval = setInterval(checkSchedule, 60000);
    
    // Show initial schedule check
    checkSchedule();
    
    // Set up random encouragement messages (every 20-40 minutes)
    const randomTimeInterval = Math.floor(Math.random() * (40 - 20 + 1) + 20) * 60000;
    const encouragementInterval = setInterval(() => {
      showRandomEncouragement();
      
      // Reset the interval with a new random time
      clearInterval(encouragementInterval);
      const newRandomInterval = Math.floor(Math.random() * (40 - 20 + 1) + 20) * 60000;
      setInterval(showRandomEncouragement, newRandomInterval);
    }, randomTimeInterval);
    
    // Clean up intervals on unmount
    return () => {
      clearInterval(scheduleInterval);
      clearInterval(encouragementInterval);
    };
  }, []);

  if (!showMessage) return null;

  // Get avatar based on message type
  const getAvatar = () => {
    if (messageType === 'schedule') {
      return "👨‍🔧"; // Quest giver
    } else {
      return "🧙‍♀️"; // Wise mage
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 mx-auto w-3/4 z-50 p-4
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'}`}
      style={{ transform: isExiting ? 'scale(0.98)' : 'scale(1)' }}
    >
      {/* RPG Dialogue Box */}
      <div className="relative">
        {/* Character Avatar */}
        <div className="avatar absolute -top-12 left-8 z-10">
          <div className="ring-primary ring-offset-base-100 w-20 h-20 rounded-full ring ring-offset-2">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        
        {/* Dialogue Box */}
        <div className="bg-gray-900/95 border-4 border-purple-400 rounded-lg p-6 pt-8 text-white shadow-2xl min-h-[140px] w-full relative">
          {/* Character Name */}
          <div className="absolute -top-4 left-32 bg-purple-400 px-4 py-1 rounded-full text-gray-900 font-bold text-base">
            {messageType === 'schedule' ? 'Quest Master' : 'Wise Sage'}
          </div>
          
          {/* Message Text with Typing Effect */}
          <div className="mt-2 font-pixel leading-relaxed text-base max-w-3xl mx-auto">
            {displayedText}
            {isTyping && <span className="animate-pulse">▌</span>}
          </div>
          
          {/* Continue/Dismiss Button */}
          {!isTyping && (
            <div className="mt-4 text-right">
              <button 
                onClick={handleDismiss}
                className="bg-purple-400 text-gray-900 px-4 py-1 rounded-md hover:bg-purple-200 transition-colors font-bold text-sm"
              >
                [Continue]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 