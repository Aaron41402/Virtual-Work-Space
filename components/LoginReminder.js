'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoginReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  
  useEffect(() => {
    // Check if user has logged in today
    const checkLoginStatus = async () => {
      try {
        // Check if reminder was dismissed today in localStorage
        const today = new Date().toISOString().split('T')[0];
        const reminderDismissed = localStorage.getItem('reminderDismissed');
        
        if (reminderDismissed === today) {
          console.log('Reminder was previously dismissed today');
          return; // Don't show reminder if already dismissed
        }
        
        const response = await fetch('/api/login-tracker');
        if (response.ok) {
          const data = await response.json();
          
          // Check if user has any login dates
          if (!data.loginDates || data.loginDates.length === 0) {
            // New user, show reminder
            setTimeout(() => setShowReminder(true), 2000);
            return;
          }
          
          // Check if user has logged in today using date string comparison
          const todayString = new Date().toISOString().split('T')[0];
          
          const hasLoggedInToday = data.loginDates.some(date => {
            const loginDateString = new Date(date).toISOString().split('T')[0];
            return loginDateString === todayString;
          });
          
          setHasCheckedIn(hasLoggedInToday);
          
          // If they haven't logged in today, show reminder
          if (!hasLoggedInToday) {
            setTimeout(() => setShowReminder(true), 2000);
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/login-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setHasCheckedIn(true);
        setShowReminder(false);
        
        // Save dismissal to localStorage
        try {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('reminderDismissed', today);
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
        
        // Reload page to update coin count
        window.location.reload();
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };
  
  const dismissReminder = () => {
    setShowReminder(false);
    
    // Save dismissal to localStorage
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('reminderDismissed', today);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };
  
  if (!showReminder) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button 
          onClick={dismissReminder}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <div className="text-center mb-4">
          <div className="inline-block mb-2">
            <Image 
              src="/calendar.png" 
              alt="Calendar" 
              width={48} 
              height={48} 
            />
          </div>
          <h2 className="text-xl font-bold font-pixel text-[#E6C86E]" style={{
            textShadow: "1px 1px 0 #000"
          }}>
            Daily Check-in
          </h2>
        </div>
        
        <p className="text-center mb-6">
          Don't forget to check in daily to earn coins! You can use coins to unlock new themes and capybara skins.
        </p>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center bg-yellow-100 px-3 py-2 rounded-lg">
            <Image 
              src="/coin.png" 
              alt="Coin" 
              width={24} 
              height={24} 
            />
            <span className="ml-2 font-medium">+1 coin for daily check-in</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          {hasCheckedIn ? (
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-md font-pixel cursor-not-allowed"
              disabled
            >
              Already Checked In
            </button>
          ) : (
            <button
              onClick={handleCheckIn}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-pixel"
            >
              Check In Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 