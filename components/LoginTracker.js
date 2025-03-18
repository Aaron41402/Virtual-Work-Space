'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoginTracker() {
  const [showPopup, setShowPopup] = useState(false);
  const [loginData, setLoginData] = useState({
    loginDates: [],
    coins: 0
  });
  const [loading, setLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');

  // Fetch login data when component mounts
  useEffect(() => {
    fetchLoginData();
  }, []);

  // Check if user already logged in today
  useEffect(() => {
    if (loginData.loginDates.length > 0) {
      const today = new Date();
      // Use the same UTC midnight approach as the backend
      today.setUTCHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      
      const alreadyCheckedIn = loginData.loginDates.some(date => {
        const loginDate = new Date(date);
        loginDate.setUTCHours(0, 0, 0, 0);
        const loginDateString = loginDate.toISOString().split('T')[0];
        return loginDateString === todayString;
      });
      
      setCheckedInToday(alreadyCheckedIn);
      
      // Add debug logging
      console.log('Today (UTC):', today.toISOString());
      console.log('Login dates:', loginData.loginDates.map(d => new Date(d).toISOString()));
      console.log('Already checked in:', alreadyCheckedIn);
    }
  }, [loginData.loginDates]);

  const fetchLoginData = async () => {
    try {
      const response = await fetch('/api/login-tracker');
      if (response.ok) {
        const data = await response.json();
        setLoginData({
          loginDates: data.loginDates.map(date => new Date(date)),
          coins: data.coins
        });
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
    }
  };

  const handleCheckIn = async () => {
    if (checkedInToday) {
      setCheckInMessage("You've already checked in today!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/login-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Check-in response:', data); // Debug logging
      
      if (response.ok) {
        // Ensure we're converting strings to Date objects
        const updatedDates = data.loginDates.map(date => new Date(date));
        
        setLoginData({
          loginDates: updatedDates,
          coins: data.coins
        });
        
        // Force the checked-in state to true
        setCheckedInToday(true);
        setCheckInMessage(data.message || 'Successfully checked in!');
        
        // Force re-render of calendar
        setTimeout(() => {
          fetchLoginData();
        }, 500);
      } else {
        setCheckInMessage(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      setCheckInMessage('Error checking in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Generate calendar for current month
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and total days in month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      
      // Check if user logged in on this day
      const loggedIn = loginData.loginDates.some(loginDate => {
        const d = new Date(loginDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === date.getTime();
      });
      
      // Check if this is today
      const isToday = day === today.getDate();
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-8 w-8 flex items-center justify-center rounded-full 
            ${loggedIn ? 'bg-green-500 text-white line-through' : 'bg-gray-100'} 
            ${isToday ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="relative">
      {/* Calendar Icon */}
      <button 
        onClick={togglePopup}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Open login calendar"
      >
        <Image 
          src="/calendar.png" 
          alt="Calendar" 
          width={32} 
          height={32} 
        />
      </button>

      {/* Popup Panel */}
      {showPopup && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
              <span>
                <Image 
                  src="/Hero.png" 
                  alt="Hero" 
                  width={32} 
                  height={32} 
                />
              </span>
            <h3 className="font-bold text-lg font-pixel">Adventurer's Log
            </h3>
            <button 
              onClick={togglePopup}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1 font-pixel">Total Coins Earned:</p>
            <p className="font-bold text-yellow-500 flex items-center">
              <span className="text-xl">{loginData.coins}</span>
              <span className="ml-1 text-lg"><Image 
                src="/coin.png" 
                alt="Coin" 
                width={20} 
                height={20} 
                />
                </span>
            </p>
          </div>
          
          {/* Calendar */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
          
          {/* Check-in Button */}
          <div className="mt-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || checkedInToday}
              className={`w-full py-2 px-4 rounded-md text-white font-pixel font-medium
                ${checkedInToday 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {loading ? 'Checking in...' : checkedInToday ? 'Already Checked In' : 'Check In Today'}
            </button>
            {checkInMessage && (
              <p className={`text-sm mt-2 ${checkedInToday ? 'text-green-500' : 'text-red-500'}`}>
                {checkInMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 