"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Edit2, Check, X, Plus, Clock, Trash2, AlertCircle } from 'lucide-react';

function TodaySchedule() {
  const { data: session } = useSession();
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [timelineHours, setTimelineHours] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingItem, setEditingItem] = useState(null);
  const [newActivity, setNewActivity] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemActivity, setNewItemActivity] = useState('');
  const [newItemTime, setNewItemTime] = useState('');
  const [newItemType, setNewItemType] = useState('routine');
  const timelineRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Close modal when clicking outside
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddModal(false);
      }
    }

    // Add event listener when modal is shown
    if (showAddModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddModal]);

  useEffect(() => {
    // Generate all 24 hours for timeline
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    setTimelineHours(hours);
    
    // Load schedule data
    loadScheduleData();
  }, [session]);

  useEffect(() => {
    // Scroll to current time when component loads
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Find the element for the current hour
      const hourElements = timelineRef.current.querySelectorAll('[data-hour]');
      for (let el of hourElements) {
        const hour = parseInt(el.getAttribute('data-hour'));
        if (hour === currentHour) {
          // Calculate position based on minutes
          const scrollOffset = el.offsetTop - 100; // Adjust to center in viewport
          timelineRef.current.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
          });
          break;
        }
      }
    }
  }, [timelineHours, loading]);

  // Check if we need to fetch new data or use cached data
  const loadScheduleData = async () => {
    try {
      const today = new Date().toDateString();
      const cachedData = localStorage.getItem('scheduleData');
      const cachedDate = localStorage.getItem('scheduleDate');
      
      // If we have cached data from today, use it
      if (cachedData && cachedDate === today) {
        console.log('Using cached schedule data');
        setSchedule(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
      
      // Otherwise fetch new data
      await fetchScheduleData();
    } catch (error) {
      console.error('Error loading schedule data:', error);
      setError('Failed to load schedule data');
      setLoading(false);
    }
  };

  // Fetch data from API
  const fetchScheduleData = async () => {
    if (!session) {
      setError('Please sign in to view your schedule');
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
          const scheduleItems = generateScheduleFromSetup(setupDetails.data);
          setSchedule(scheduleItems);
          
          // Cache the generated schedule
          const today = new Date().toDateString();
          localStorage.setItem('scheduleDate', today);
          localStorage.setItem('scheduleData', JSON.stringify(scheduleItems));
          setLoading(false);
        } else {
          setError(setupDetails.error || 'Failed to fetch setup details');
          setLoading(false);
        }
      } else {
        setError('Please complete your setup to generate a schedule');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching setup data:', err);
      setError('Failed to load schedule data');
      setLoading(false);
    }
  };

  // Generate a schedule based on the user's setup data
  const generateScheduleFromSetup = (data) => {
    if (!data) return [];

    const scheduleItems = [];
    
    // Add wake up time
    if (data.wakeTime) {
      scheduleItems.push({
        id: 'wake',
        time: data.wakeTime,
        activity: 'Wake up',
        type: 'routine'
      });
    }

    // Add morning routine (30 min after wake time)
    if (data.wakeTime) {
      const wakeHour = parseInt(data.wakeTime.split(':')[0]);
      const wakeMinute = parseInt(data.wakeTime.split(':')[1]);
      
      let morningRoutineHour = wakeHour;
      let morningRoutineMinute = wakeMinute + 30;
      
      if (morningRoutineMinute >= 60) {
        morningRoutineHour = (morningRoutineHour + 1) % 24;
        morningRoutineMinute = morningRoutineMinute - 60;
      }
      
      scheduleItems.push({
        id: 'morning',
        time: `${morningRoutineHour.toString().padStart(2, '0')}:${morningRoutineMinute.toString().padStart(2, '0')}`,
        activity: 'Morning routine',
        type: 'routine'
      });
    }

    // Add priorities from setup
    if (data.priorities) {
      const priorities = data.priorities.split(',').map(p => p.trim());
      
      priorities.forEach((priority, index) => {
        const priorityHour = (9 + index) % 24;
        scheduleItems.push({
          id: `priority-${index}`,
          time: `${priorityHour.toString().padStart(2, '0')}:00`,
          activity: priority,
          type: 'priority'
        });
      });
    }

    // Add lunch time
    scheduleItems.push({
      id: 'lunch',
      time: '12:00',
      activity: 'Lunch break',
      type: 'routine'
    });

    // Add habits from setup
    if (data.habits) {
      const habits = data.habits.split(',').map(h => h.trim());
      
      habits.forEach((habit, index) => {
        const habitHour = (14 + index) % 24;
        scheduleItems.push({
          id: `habit-${index}`,
          time: `${habitHour.toString().padStart(2, '0')}:00`,
          activity: habit,
          type: 'habit'
        });
      });
    }

    // Add dinner time
    scheduleItems.push({
      id: 'dinner',
      time: '18:00',
      activity: 'Dinner',
      type: 'routine'
    });

    // Add bedtime
    if (data.bedTime) {
      scheduleItems.push({
        id: 'bed',
        time: data.bedTime,
        activity: 'Bedtime',
        type: 'routine'
      });
    }

    // Sort schedule by time
    return scheduleItems.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
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

  // Check if an hour is in the past
  const isHourPast = (hour) => {
    const now = new Date();
    const currentHour = now.getHours();
    const hourNum = parseInt(hour.split(':')[0]);
    
    return hourNum < currentHour;
  };

  // Get background color based on activity type
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'routine':
        return 'bg-blue-200/90';
      case 'priority':
        return 'bg-yellow-200/90';
      case 'habit':
        return 'bg-purple-200/90';
      default:
        return 'bg-gray-200/90';
    }
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem(item.id);
    setNewActivity(item.activity);
    setNewTime(item.time);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setNewActivity('');
    setNewTime('');
  };

  // Save edited item
  const saveEdit = (itemId) => {
    if (!newActivity.trim()) return;

    const updatedSchedule = schedule.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          activity: newActivity.trim(),
          time: newTime
        };
      }
      return item;
    });

    setSchedule(updatedSchedule);
    setEditingItem(null);
    setNewActivity('');
    setNewTime('');
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
  };

  // Delete an item
  const deleteItem = (itemId) => {
    const updatedSchedule = schedule.filter(item => item.id !== itemId);
    setSchedule(updatedSchedule);
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
  };

  // Add a new item
  const addNewItem = () => {
    if (!newItemActivity.trim() || !newItemTime) return;

    const newItem = {
      id: `item-${Date.now()}`,
      time: newItemTime,
      activity: newItemActivity.trim(),
      type: newItemType
    };

    const updatedSchedule = [...schedule, newItem].sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
    
    setSchedule(updatedSchedule);
    setNewItemActivity('');
    setNewItemTime('');
    setShowAddModal(false);
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
  };

  // Open add modal with hour pre-filled
  const openAddModalWithHour = (hour) => {
    setNewItemTime(hour);
    setShowAddModal(true);
  };

  // Reset schedule data (for testing)
  const resetScheduleData = () => {
    localStorage.removeItem('scheduleData');
    localStorage.removeItem('scheduleDate');
    window.location.reload();
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
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <p>{error}</p>
          </div>
          <p className="text-sm text-gray-600">
            You can create a custom schedule by clicking the "+" button.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 relative z-10">
      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-black font-bold">Today's Schedule</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Current time indicator */}
        <div className="flex items-center mb-3 text-sm text-gray-700">
          <Clock size={16} className="mr-1" />
          <span>Current time: {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded mr-1"></div>
            <span>Routine</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded mr-1"></div>
            <span>Priority</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-purple-100 border border-purple-500 rounded mr-1"></div>
            <span>Habit</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-gray-100 border border-slate-500 rounded mr-1"></div>
            <span>Free Time</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></div>
            <span>Current</span>
          </div>
        </div>

        {timelineHours.length > 0 ? (
          <div 
            ref={timelineRef}
            className="space-y-2 max-h-[350px] overflow-y-auto pr-2 relative"
          >
            {timelineHours.map((hour, index) => {
              const activity = getActivityForHour(hour);
              const isPast = isHourPast(hour);
              const isCurrentHour = currentTime.getHours() === parseInt(hour);
              
              return (
                <div 
                  key={index} 
                  className={`flex items-start ${isCurrentHour ? 'bg-green-300/80 -mx-2 px-2 py-1 rounded' : ''}`}
                  data-hour={hour.split(':')[0]}
                >
                  <div className="w-16 text-sm text-gray-600">{hour}</div>
                  {activity ? (
                    <div className={`flex-1 ${getBackgroundColor(activity.type)} p-2 rounded text-sm ${isPast ? 'line-through opacity-60' : ''}`}>
                      {editingItem === activity.id ? (
                        <div className="flex flex-col space-y-2">
                          <input 
                            type="time" 
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="w-full p-1 text-xs border rounded"
                          />
                          <input 
                            type="text" 
                            value={newActivity}
                            onChange={(e) => setNewActivity(e.target.value)}
                            className="w-full p-1 text-xs border rounded"
                          />
                          <div className="flex justify-end space-x-1">
                            <button 
                              onClick={() => saveEdit(activity.id)}
                              className="p-1 bg-green-500 text-white rounded"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="p-1 bg-gray-500 text-white rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span>{activity.activity}</span>
                          {!isPast && (
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => startEditing(activity)}
                                className="text-gray-500 hover:text-blue-500"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteItem(activity.id)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className={`flex-1 bg-gray-50/50 p-2 rounded text-gray-400 text-sm ${isPast ? 'line-through opacity-60' : ''} hover:bg-gray-100/50 cursor-pointer`}
                      onClick={() => !isPast && openAddModalWithHour(hour)}
                    >
                      Free time
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No schedule items yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create Your Schedule
            </button>
          </div>
        )}
        
        {/* Debug button - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-right">
            <button 
              onClick={resetScheduleData}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Reset Schedule Data
            </button>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Time</label>
                <input 
                  type="time" 
                  value={newItemTime}
                  onChange={(e) => setNewItemTime(e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Type</label>
                <select 
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="routine">Routine</option>
                  <option value="priority">Priority</option>
                  <option value="habit">Habit</option>
                  <option value="free">Free Time</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Activity</label>
              <input 
                type="text" 
                value={newItemActivity}
                onChange={(e) => setNewItemActivity(e.target.value)}
                placeholder="Enter activity name"
                className="w-full p-2 text-sm border rounded"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={addNewItem}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodaySchedule;

