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
  const [showReminder, setShowReminder] = useState(false);

  // Fetch login data when component mounts and check localStorage
  useEffect(() => {
    fetchLoginData();
    
    // Check if reminder was dismissed today in localStorage
    const checkLocalStorage = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const reminderDismissed = localStorage.getItem('reminderDismissed');
        
        if (reminderDismissed === today) {
          console.log('Reminder was previously dismissed today');
          setShowReminder(false);
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
      }
    };
    
    checkLocalStorage();
  }, []);

  // Check if user already logged in today and manage reminder
  useEffect(() => {
    if (loginData.loginDates.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      
      const alreadyCheckedIn = loginData.loginDates.some(date => {
        const loginDate = new Date(date);
        loginDate.setUTCHours(0, 0, 0, 0);
        const loginDateString = loginDate.toISOString().split('T')[0];
        return loginDateString === todayString;
      });
      
      setCheckedInToday(alreadyCheckedIn);
      
      // If checked in, dismiss reminder and save to localStorage
      if (alreadyCheckedIn) {
        setShowReminder(false);
        try {
          localStorage.setItem('reminderDismissed', todayString);
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
      } else {
        // Only show reminder if not already dismissed in localStorage
        try {
          const reminderDismissed = localStorage.getItem('reminderDismissed');
          if (reminderDismissed !== todayString) {
            setShowReminder(true);
          }
        } catch (error) {
          console.error('Error checking localStorage:', error);
          setShowReminder(true);
        }
      }
      
      // Add debug logging
      console.log('Today (UTC):', today.toISOString());
      console.log('Login dates:', loginData.loginDates.map(d => new Date(d).toISOString()));
      console.log('Already checked in:', alreadyCheckedIn);
      console.log('Show reminder:', !alreadyCheckedIn);
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
        // Immediately update the checked-in state
        setCheckedInToday(true);
        
        // Hide the reminder and save to localStorage
        setShowReminder(false);
        try {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('reminderDismissed', today);
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
        
        setCheckInMessage(data.message || 'Successfully checked in!');
        
        // Add today's date to the loginDates array directly
        const today = new Date();
        const updatedDates = [...loginData.loginDates, today];
        
        setLoginData({
          loginDates: updatedDates,
          coins: data.coins
        });
        
        // Force a complete refresh of data after a short delay
        setTimeout(() => {
          fetchLoginData();
        }, 300);
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

  // Add a function to check if a specific date is checked in
  const isDateCheckedIn = (date) => {
    // Convert to UTC date string for comparison
    const dateString = new Date(date).toISOString().split('T')[0];
    
    return loginData.loginDates.some(loginDate => {
      const loginDateString = new Date(loginDate).toISOString().split('T')[0];
      return loginDateString === dateString;
    });
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    
    // Hide reminder when calendar is opened and save to localStorage
    setShowReminder(false);
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('reminderDismissed', today);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  // Modify the renderCalendar function to use the isDateCheckedIn helper
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
      // Create date object for this calendar day
      const date = new Date(currentYear, currentMonth, day);
      
      // Check if user logged in on this day using our helper
      const loggedIn = isDateCheckedIn(date);
      
      // Check if this is today
      const isToday = day === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      
      // If this is today, force it to show as checked in if checkedInToday is true
      const showAsCheckedIn = (isToday && checkedInToday) || loggedIn;
      
      // Debug today's check-in status
      if (isToday) {
        console.log('Calendar - Today is checked in:', showAsCheckedIn, 'checkedInToday:', checkedInToday);
      }
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-8 w-8 flex items-center justify-center rounded-full 
            ${showAsCheckedIn ? 'bg-green-500 text-white line-through' : 'bg-gray-100'} 
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
        {showReminder && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
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