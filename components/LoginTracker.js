'use client';
import { useState, useEffect, useCallback } from 'react';
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

// Make fetchLoginData a useCallback function so it can be referenced in multiple places
const fetchLoginData = useCallback(async () => {
    console.log('Fetching login data...');
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
        console.log('Received login data:', data);
        
        // Ensure we're setting the coins correctly
        setLoginData({
          loginDates: Array.isArray(data.loginDates) 
            ? data.loginDates.map(date => new Date(date))
            : [],
          coins: typeof data.coins === 'number' ? data.coins : 0
        });
        
        setCheckedInToday(data.checkedInToday === true);
    }
    } catch (error) {
    console.error('Error fetching login data:', error);
    }
}, []);

// Add a listener for the refresh event
useEffect(() => {
    const handleRefreshEvent = () => {
    console.log('Refresh event received');
    fetchLoginData();
    };
    
    window.addEventListener('refresh-login-data', handleRefreshEvent);
    
    return () => {
    window.removeEventListener('refresh-login-data', handleRefreshEvent);
    };
}, [fetchLoginData]);

// Modify the existing event listener
useEffect(() => {
    fetchLoginData();
    
    // Listen for check-in events from LoginReminder
    const handleCheckInEvent = (event) => {
    console.log('Check-in event received:', event.detail);
    
    // Force check-in status to true when we receive a check-in event
    setCheckedInToday(true);
    setCheckInMessage("Check-in successful! You earned 1 coin.");
    
    // Update loginData with the event detail data
    if (event.detail) {
        const loginDates = Array.isArray(event.detail.loginDates) 
          ? event.detail.loginDates.map(date => new Date(date))
          : [];
          
        setLoginData({
          loginDates,
          coins: event.detail.coins || 0
        });
    }
    
    // Then refresh data from server to be sure
    setTimeout(() => fetchLoginData(), 500);
    };
    
    window.addEventListener('user-checked-in', handleCheckInEvent);
    
    return () => {
    window.removeEventListener('user-checked-in', handleCheckInEvent);
    };
}, [fetchLoginData]);

const handleCheckIn = async () => {
    if (checkedInToday) {
    setCheckInMessage("You've already checked in today!");
    return;
    }

    setLoading(true);
    try {
    const response = await fetch('/api/login-tracker', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
    });

    const data = await response.json();
    console.log('Check-in response:', data);
    
    if (response.ok) {
        setLoginData({
          loginDates: data.loginDates.map(date => new Date(date)),
          coins: data.coins
        });
        
        setCheckedInToday(true);
        setCheckInMessage(data.message);
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
    // Refresh data when opening popup
    if (!showPopup) {
      fetchLoginData();
    }
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
    
    // Check if user logged in on this day - use the same day comparison function
    const loggedIn = loginData.loginDates.some(loginDate => 
      isSameDay(loginDate, date)
    );

    // Check if this is today
    const isToday = day === today.getDate();

    // Force today to be marked as logged in if checkedInToday is true
    const isMarkedLoggedIn = (isToday && checkedInToday) || loggedIn;

    days.push(
        <div 
        key={`day-${day}`} 
        className={`h-8 w-8 flex items-center justify-center rounded-full 
            ${isMarkedLoggedIn ? 'bg-green-500 text-white line-through' : 'bg-gray-100'} 
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
                className="rounded-full" 
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