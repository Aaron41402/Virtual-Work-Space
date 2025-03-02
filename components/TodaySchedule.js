"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function TodaySchedule() {
  const { data: session } = useSession();
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [timelineHours, setTimelineHours] = useState([]);

  useEffect(() => {
    const fetchSetupData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        // Fetch the user's setup data
        console.log("Fetching setup status...");
        const response = await fetch('/api/setup', {
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
          },
          credentials: 'include', // Important for cookies/session
        });
        const data = await response.json();
        console.log("Setup status response:", data);
        
        if (response.ok && data.hasSetup) {
          // Fetch the actual setup response data
          console.log("Fetching setup details...");
          const detailsResponse = await fetch('/api/setup/details');
          const setupDetails = await detailsResponse.json();
          console.log("Setup details response:", setupDetails);
          
          if (detailsResponse.ok) {
            setSetupData(setupDetails.data);
            generateSchedule(setupDetails.data);
          } else {
            console.error("Error in setup details response:", setupDetails.error);
            setError(setupDetails.error || 'Failed to fetch setup details');
          }
        } else {
          console.error("Error in setup status response:", data.error || "No setup data found");
          setError('Setup data not found');
        }
      } catch (err) {
        console.error('Error fetching setup data:', err);
        setError('Failed to load schedule data: ' + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, [session]);

  // Generate a schedule based on the user's setup data
  const generateSchedule = (data) => {
    if (!data) return;

    const scheduleItems = [];
    
    // Parse wake time and bed time
    const wakeTime = data.wakeTime || '07:00';
    const bedTime = data.bedTime || '22:00';
    
    // Parse hours for timeline
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const bedHour = parseInt(bedTime.split(':')[0]);
    
    // Generate timeline hours
    const hours = [];
    let currentHour = wakeHour;
    
    // Handle case where bedtime is earlier than wake time (next day)
    const totalHours = bedHour <= wakeHour ? (24 - wakeHour) + bedHour : bedHour - wakeHour;
    
    for (let i = 0; i <= totalHours; i++) {
      const hour = (wakeHour + i) % 24;
      hours.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    setTimelineHours(hours);
    
    // Add wake up time
    scheduleItems.push({
      time: wakeTime,
      activity: 'Wake up',
      type: 'routine'
    });

    // Add morning routine
    const morningRoutineHour = (wakeHour + 1) % 24;
    scheduleItems.push({
      time: `${morningRoutineHour.toString().padStart(2, '0')}:00`,
      activity: 'Morning routine',
      type: 'routine'
    });

    // Add priorities from setup
    if (data.priorities) {
      const priorities = data.priorities.split(',').map(p => p.trim());
      const midDay = (wakeHour + 4) % 24;
      
      priorities.slice(0, 2).forEach((priority, index) => {
        scheduleItems.push({
          time: `${(midDay + index * 2).toString().padStart(2, '0')}:00`,
          activity: priority,
          type: 'priority'
        });
      });
    }

    // Add habits from setup
    if (data.habits) {
      const habits = data.habits.split(',').map(h => h.trim());
      const afternoonHour = (wakeHour + 8) % 24;
      
      habits.slice(0, 2).forEach((habit, index) => {
        scheduleItems.push({
          time: `${(afternoonHour + index * 2).toString().padStart(2, '0')}:00`,
          activity: habit,
          type: 'habit'
        });
      });
    }

    // Add free time if specified
    if (data.freeTime) {
      const eveningHour = (wakeHour + 12) % 24;
      scheduleItems.push({
        time: `${eveningHour.toString().padStart(2, '0')}:00`,
        activity: 'Free time: ' + data.freeTime,
        type: 'free'
      });
    }

    // Add bedtime
    scheduleItems.push({
      time: bedTime,
      activity: 'Bedtime',
      type: 'routine'
    });

    setSchedule(scheduleItems);
  };

  // Get activity for a specific hour
  const getActivityForHour = (hour) => {
    const activity = schedule.find(item => {
      const itemHour = item.time.split(':')[0].padStart(2, '0');
      const itemMinute = item.time.split(':')[1] || '00';
      return `${itemHour}:${itemMinute}` === hour || itemHour === hour.split(':')[0];
    });
    
    return activity || null;
  };

  // Get background color based on activity type
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'routine':
        return 'bg-blue-50/90';
      case 'priority':
        return 'bg-green-50/90';
      case 'habit':
        return 'bg-purple-50/90';
      case 'free':
        return 'bg-yellow-50/90';
      default:
        return 'bg-gray-50/90';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-1/2 mx-auto mt-16 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
          <p>Loading your personalized schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-1/2 mx-auto mt-16 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
          <p className="text-red-500">{error}</p>
          <p>Please complete the setup process to see your personalized schedule.</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-semibold">Troubleshooting:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Make sure you've completed the setup questionnaire</li>
              <li>Try refreshing the page</li>
              <li>Try logging out and logging back in</li>
              <li>If problems persist, please contact support</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 relative z-10">
      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-sm w-1/2 mx-auto mt-16 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
        {timelineHours.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {timelineHours.map((hour, index) => {
              const activity = getActivityForHour(hour);
              return (
                <div key={index} className="flex items-start">
                  <div className="w-24 text-gray-600">{hour}</div>
                  {activity ? (
                    <div className={`flex-1 ${getBackgroundColor(activity.type)} p-3 rounded`}>
                      {activity.activity}
                    </div>
                  ) : (
                    <div className="flex-1 bg-gray-50/50 p-3 rounded text-gray-400">
                      Free time
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No schedule items available. Please complete the setup process.</p>
        )}
      </div>
    </div>
  );
}

export default TodaySchedule;