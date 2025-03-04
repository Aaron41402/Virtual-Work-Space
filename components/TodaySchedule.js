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
    // Comment out the API call and use dummy data instead
    /*
    const fetchSetupData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        // Fetch the user's setup data
        const response = await fetch('/api/setup');
        const data = await response.json();
        
        if (response.ok && data.hasSetup) {
          // Fetch the actual setup response data
          const detailsResponse = await fetch('/api/setup/details');
          const setupDetails = await detailsResponse.json();
          
          if (detailsResponse.ok) {
            setSetupData(setupDetails.data);
            generateSchedule(setupDetails.data);
          } else {
            setError(setupDetails.error || 'Failed to fetch setup details');
          }
        } else {
          setError('Setup data not found');
        }
      } catch (err) {
        console.error('Error fetching setup data:', err);
        setError('Failed to load schedule data');
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
    */

    // Use dummy data instead
    const dummyData = {
      wakeTime: '07:00',
      bedTime: '22:00',
      priorities: 'Complete project, Study for exam, Exercise',
      habits: 'Meditation, Reading, Journaling'
    };

    generateSchedule(dummyData);
    setLoading(false);
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

    // Add lunch time
    scheduleItems.push({
      time: `${(wakeHour + 5).toString().padStart(2, '0')}:00`,
      activity: 'Lunch break',
      type: 'routine'
    });

    // Add dinner time
    scheduleItems.push({
      time: `${(wakeHour + 11).toString().padStart(2, '0')}:00`,
      activity: 'Dinner',
      type: 'routine'
    });

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
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          <p>Loading your personalized schedule <span className="loading loading-dots loading-xs"></span></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
          <p className="text-red-500">{error}</p>
          <p>Please complete the setup process to see your personalized schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 relative z-10">
      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-3">Today's Schedule</h2>
        {timelineHours.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {timelineHours.map((hour, index) => {
              const activity = getActivityForHour(hour);
              return (
                <div key={index} className="flex items-start">
                  <div className="w-16 text-sm text-gray-600">{hour}</div>
                  {activity ? (
                    <div className={`flex-1 ${getBackgroundColor(activity.type)} p-2 rounded text-sm`}>
                      {activity.activity}
                    </div>
                  ) : (
                    <div className="flex-1 bg-gray-50/50 p-2 rounded text-gray-400 text-sm">
                      Free time
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading your personalized schedule <span className="loading loading-dots loading-xs"></span></p>
        )}
      </div>
    </div>
  );
}

export default TodaySchedule;