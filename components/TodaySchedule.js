"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Edit2, Check, X, Plus, Clock, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    // Generate all 24 hours for timeline
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    setTimelineHours(hours);
    
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
    
    // Add wake up time
    scheduleItems.push({
      id: 'wake',
      time: data.wakeTime || '07:00',
      activity: 'Wake up',
      type: 'routine'
    });

    // Add morning routine
    scheduleItems.push({
      id: 'morning',
      time: '08:00',
      activity: 'Morning routine',
      type: 'routine'
    });

    // Add priorities from setup
    if (data.priorities) {
      const priorities = data.priorities.split(',').map(p => p.trim());
      
      priorities.slice(0, 2).forEach((priority, index) => {
        scheduleItems.push({
          id: `priority-${index}`,
          time: `${(10 + index * 2).toString().padStart(2, '0')}:00`,
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
      
      habits.slice(0, 2).forEach((habit, index) => {
        scheduleItems.push({
          id: `habit-${index}`,
          time: `${(14 + index * 2).toString().padStart(2, '0')}:00`,
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
    scheduleItems.push({
      id: 'bed',
      time: data.bedTime || '22:00',
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

  // Check if an hour is in the past
  const isHourPast = (hour) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const hourNum = parseInt(hour.split(':')[0]);
    const minuteNum = parseInt(hour.split(':')[1] || '0');
    
    return hourNum < currentHour || (hourNum === currentHour && minuteNum < currentMinute);
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem(item.id);
    setNewActivity(item.activity);
    setNewTime(item.time);
  };

  // Save edited item
  const saveEdit = (itemId) => {
    setSchedule(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, activity: newActivity, time: newTime }
        : item
    ));
    setEditingItem(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
  };

  // Delete an item
  const deleteItem = (itemId) => {
    setSchedule(prev => prev.filter(item => item.id !== itemId));
  };

  // Add new item
  const addNewItem = () => {
    if (newItemActivity.trim() && newItemTime) {
      const newItem = {
        id: `item-${Date.now()}`,
        time: newItemTime,
        activity: newItemActivity.trim(),
        type: newItemType
      };
      
      setSchedule(prev => [...prev, newItem]);
      setNewItemActivity('');
      setNewItemTime('');
      setShowAddModal(false);
    }
  };

  // Open add modal with current hour pre-filled
  const openAddModalWithHour = (hour) => {
    setNewItemTime(hour);
    setShowAddModal(true);
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
        <div className="flex items-center mb-3 text-sm text-gray-600">
          <Clock size={16} className="mr-1" />
          <span>Current time: {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded mr-1"></div>
            <span>Routine</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded mr-1"></div>
            <span>Priority</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-purple-50 border border-purple-200 rounded mr-1"></div>
            <span>Habit</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded mr-1"></div>
            <span>Free Time</span>
          </div>
        </div>

        {timelineHours.length > 0 ? (
          <div 
            ref={timelineRef}
            className="space-y-2 max-h-[400px] overflow-y-auto pr-2 relative"
          >
            {timelineHours.map((hour, index) => {
              const activity = getActivityForHour(hour);
              const isPast = isHourPast(hour);
              const isCurrentHour = currentTime.getHours() === parseInt(hour);
              
              return (
                <div 
                  key={index} 
                  className={`flex items-start ${isCurrentHour ? 'bg-yellow-100/50 -mx-2 px-2 py-1 rounded' : ''}`}
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
          <p>Loading your personalized schedule <span className="loading loading-dots loading-xs"></span></p>
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

