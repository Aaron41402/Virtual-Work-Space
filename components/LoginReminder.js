'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoginReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const textStyle = {
    fontFamily: "'VT323', monospace",
    fontSize: "1.2rem"
  };
  // Helper function to compare dates without time
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };
  
  useEffect(() => {
    // Check if user has logged in today
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/login-tracker', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          
          // If API explicitly tells us they've checked in today
          if (data.checkedInToday) {
            setHasCheckedIn(true);
            return;
          }
          
          // Check if user has any login dates
          if (!data.loginDates || data.loginDates.length === 0) {
            // New user, show reminder
            setTimeout(() => setShowReminder(true), 2000);
            return;
          }
          
          // Check if user has logged in today
          const today = new Date();
          
          const hasLoggedInToday = data.loginDates.some(date => 
            isSameDay(new Date(date), today)
          );
          
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
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/login-tracker', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Check-in response in reminder:', data);
        setHasCheckedIn(true);
        
        // Create properly structured event data with coins
        const eventData = {
          loginDates: Array.isArray(data.loginDates) ? data.loginDates : [],
          coins: data.coins,
          checkedInToday: true
        };
        
        // Dispatch event with timeout to ensure DOM is ready
        setTimeout(() => {
          const checkInEvent = new CustomEvent('user-checked-in', { 
            detail: eventData
          });
          window.dispatchEvent(checkInEvent);
          console.log('Event dispatched with data:', eventData);
        }, 100);
        
        setShowReminder(false);
      } else {
        console.error('Check-in failed:', await response.text());
      }
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const dismissReminder = () => {
    setShowReminder(false);
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
        
        <p className="text-center mb-6" style={textStyle}>
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
            <span className="ml-2 font-medium" style={textStyle}>+1 coin for daily check-in</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          {hasCheckedIn ? (
            <button
              className="px-4 py-2 bg-gray-400 text-white font-pixel rounded-md cursor-not-allowed"
              disabled
            >
              Already Checked In
            </button>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-pixel"
            >
              {isLoading ? 'Checking in...' : 'Check In Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}