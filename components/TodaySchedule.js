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
  const [newItemEndTime, setNewItemEndTime] = useState('');
  const [newItemType, setNewItemType] = useState('routine');
  const [isTimeRange, setIsTimeRange] = useState(false);
  const timelineRef = useRef(null);
  const modalRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    time: false,
    activity: false
  });
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);

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
        handleCloseModal();
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
        setError(false);
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
    const hourNum = parseInt(hour.split(':')[0]);
    const minuteNum = parseInt(hour.split(':')[1] || '00');
    
    // Find activities that include this hour
    const activity = schedule.find(item => {
      const itemHour = parseInt(item.time.split(':')[0]);
      const itemMinute = parseInt(item.time.split(':')[1] || '00');
      
      // If the item has an end time, check if current hour is within range
      if (item.endTime) {
        const endHour = parseInt(item.endTime.split(':')[0]);
        const endMinute = parseInt(item.endTime.split(':')[1] || '00');
        
        // Check if hour is between start and end times
        if (itemHour < endHour) {
          // Simple case: start hour is less than end hour
          return (hourNum > itemHour || (hourNum === itemHour && minuteNum >= itemMinute)) && 
                 (hourNum < endHour || (hourNum === endHour && minuteNum < endMinute));
        } else if (itemHour > endHour) {
          // Case where time range crosses midnight
          return (hourNum > itemHour || (hourNum === itemHour && minuteNum >= itemMinute)) || 
                 (hourNum < endHour || (hourNum === endHour && minuteNum < endMinute));
        } else {
          // Case where start and end hours are the same
          return hourNum === itemHour && minuteNum >= itemMinute && minuteNum < endMinute;
        }
      }
      
      // For items without end time, use the original logic
      return `${itemHour.toString().padStart(2, '0')}:${itemMinute.toString().padStart(2, '0')}` === hour || 
             itemHour === hourNum;
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
  const saveEdit = async (itemId) => {
    if (!newActivity.trim()) return;

    // Find the original item before updating
    const originalItem = schedule.find(item => item.id === itemId);
    
    // Create the updated item
    const updatedItem = {
      ...originalItem,
      activity: newActivity.trim(),
      time: newTime
    };
    
    // Update the schedule
    const updatedSchedule = schedule.map(item => {
      if (item.id === itemId) {
        return updatedItem;
      }
      return item;
    });

    setSchedule(updatedSchedule);
    setEditingItem(null);
    setNewActivity('');
    setNewTime('');
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
    
    // If the item is a priority or habit, update the corresponding To-Do list item
    if (originalItem && (originalItem.type === 'priority' || originalItem.type === 'habit')) {
      await updateToDoListItem(originalItem, updatedItem);
    }
  };

  // Function to update an item in the To-Do list
  const updateToDoListItem = async (originalItem, updatedItem) => {
    try {
      // Get existing tasks from localStorage
      const cachedTasks = localStorage.getItem('tasks');
      if (!cachedTasks) return;
      
      let tasks = JSON.parse(cachedTasks);
      
      // Find tasks that match the original schedule item
      const matchingTasks = tasks.filter(task => 
        task.title === originalItem.activity && 
        task.description.includes(`Added from schedule (${originalItem.time}`)
      );
      
      if (matchingTasks.length === 0) return;
      
      // Update matching tasks
      const updatedTasks = tasks.map(task => {
        if (task.title === originalItem.activity && 
            task.description.includes(`Added from schedule (${originalItem.time}`)) {
          return {
            ...task,
            title: updatedItem.activity,
            description: `Added from schedule (${updatedItem.time}${updatedItem.endTime ? ` - ${updatedItem.endTime}` : ''})`,
            // Keep the same priority level
          };
        }
        return task;
      });
      
      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Try to update in API if available
      for (const originalTask of matchingTasks) {
        try {
          if (originalTask._id && !originalTask._id.startsWith('task-')) { // Only update if it has a real server ID
            const updatedTask = updatedTasks.find(t => t._id === originalTask._id);
            
            await fetch('/api/task', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: originalTask._id,
                title: updatedTask.title,
                description: updatedTask.description,
                // Keep other properties the same
                priority: originalTask.priority,
                status: originalTask.status
              }),
            });
          }
        } catch (error) {
          console.error('Error updating task in API:', error);
          // Continue with local storage version even if API fails
        }
      }
      
      // Show notification
      setNotification({
        show: true,
        message: `"${updatedItem.activity}" also updated in your To-Do list`
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error updating To-Do list item:', error);
    }
  };

  // Delete an item
  const deleteItem = async (itemId) => {
    const updatedSchedule = schedule.filter(item => item.id !== itemId);
    setSchedule(updatedSchedule);
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
    
    // If the deleted item was a priority or habit, also remove from To-Do list
    const itemToDelete = schedule.find(item => item.id === itemId);
    if (itemToDelete && (itemToDelete.type === 'priority' || itemToDelete.type === 'habit')) {
      await removeFromToDoList(itemToDelete);
    }
  };

  // Add a new item
  const addNewItem = () => {
    setValidationErrors({
      time: false,
      activity: false
    });
    
    let hasError = false;
    
    if (!newItemTime) {
      setValidationErrors(prev => ({ ...prev, time: true }));
      hasError = true;
    }
    
    if (!newItemActivity.trim()) {
      setValidationErrors(prev => ({ ...prev, activity: true }));
      hasError = true;
    }
    
    if (isTimeRange && (!newItemEndTime || newItemEndTime <= newItemTime)) {
      alert("End time must be after start time");
      return;
    }

    if (hasError) return;

    const newItem = {
      id: `item-${Date.now()}`,
      time: newItemTime,
      activity: newItemActivity.trim(),
      type: newItemType,
      // Add end time if using time range
      ...(isTimeRange && { endTime: newItemEndTime })
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
    setNewItemEndTime(''); // Reset end time
    setIsTimeRange(false); // Reset time range toggle
    setShowAddModal(false);
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
    
    // If the item is a priority or habit, add it to the to-do list
    if (newItemType === 'priority' || newItemType === 'habit') {
      addToToDoList(newItem);
    }
  };

  // Function to add item to To-Do list
  const addToToDoList = async (item) => {
    try {
      // Get existing tasks from localStorage
      const cachedTasks = localStorage.getItem('tasks');
      let tasks = cachedTasks ? JSON.parse(cachedTasks) : [];
      
      // Create new task object
      const newTask = {
        _id: `task-${Date.now()}`, // Generate a temporary ID
        title: item.activity,
        description: `Added from schedule (${item.time}${item.endTime ? ` - ${item.endTime}` : ''})`,
        priority: item.type === 'priority' ? 'High' : 'Medium',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      // Add to tasks array
      tasks.push(newTask);
      
      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      // Try to save to API if available
      try {
        const response = await fetch('/api/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            status: newTask.status
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update the task in localStorage with the real ID from the server
          const updatedTasks = tasks.map(t => 
            t._id === newTask._id ? { ...data.task } : t
          );
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        }
      } catch (error) {
        console.error('Error saving task to API:', error);
        // Continue with local storage version even if API fails
      }
      
      // Show notification
      setNotification({
        show: true,
        message: `"${item.activity}" also added to your To-Do list`
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error adding to To-Do list:', error);
    }
  };

  // Open add modal with hour pre-filled
  const openAddModalWithHour = (hour) => {
    setNewItemTime(hour);
    
    // Calculate a default end time (1 hour later)
    const [hourStr, minuteStr] = hour.split(':');
    let endHour = parseInt(hourStr) + 1;
    if (endHour >= 24) endHour = 0;
    setNewItemEndTime(`${endHour.toString().padStart(2, '0')}:${minuteStr}`);
    
    setShowAddModal(true);
  };

  // Reset schedule data (for testing)
  const resetScheduleData = () => {
    localStorage.removeItem('scheduleData');
    localStorage.removeItem('scheduleDate');
    window.location.reload();
  };

  // Add a function to handle modal closing
  const handleCloseModal = () => {
    setShowAddModal(false);
    setValidationErrors({
        time: false,
        activity: false
    });
    setNewItemActivity('');
    setNewItemTime('');
    setNewItemEndTime('');
    setIsTimeRange(false);
  };

  // Add this function to handle item deletion
  const handleDeleteItem = async (itemId) => {
    // Find the item to be deleted
    const itemToDelete = schedule.find(item => item.id === itemId);
    
    if (!itemToDelete) return;
    
    // Remove from schedule
    const updatedSchedule = schedule.filter(item => item.id !== itemId);
    setSchedule(updatedSchedule);
    
    // Update localStorage
    localStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
    
    // If the deleted item was a priority or habit, also remove from To-Do list
    if (itemToDelete.type === 'priority' || itemToDelete.type === 'habit') {
      await removeFromToDoList(itemToDelete);
    }
  };

  // Function to remove item from To-Do list
  const removeFromToDoList = async (scheduleItem) => {
    try {
      // Get existing tasks from localStorage
      const cachedTasks = localStorage.getItem('tasks');
      if (!cachedTasks) return;
      
      let tasks = JSON.parse(cachedTasks);
      
      // Find tasks that match this schedule item
      // We'll match by title and description containing the time
      const matchingTasks = tasks.filter(task => 
        task.title === scheduleItem.activity && 
        task.description.includes(`Added from schedule (${scheduleItem.time}`)
      );
      
      if (matchingTasks.length === 0) return;
      
      // Remove matching tasks
      const updatedTasks = tasks.filter(task => 
        !(task.title === scheduleItem.activity && 
          task.description.includes(`Added from schedule (${scheduleItem.time}`))
      );
      
      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Try to delete from API if available
      for (const task of matchingTasks) {
        try {
          if (task._id && !task._id.startsWith('task-')) { // Only delete if it has a real server ID
            await fetch(`/api/task?id=${task._id}`, {
              method: 'DELETE',
            });
          }
        } catch (error) {
          console.error('Error deleting task from API:', error);
          // Continue with local storage version even if API fails
        }
      }
      
      // Show notification
      setNotification({
        show: true,
        message: `"${scheduleItem.activity}" also removed from your To-Do list`
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error removing from To-Do list:', error);
    }
  };

  const createSchedule = async () => {
    setIsCreatingSchedule(true);
    await loadScheduleData();
    setIsCreatingSchedule(false);
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 mt-24 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-2xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>TODAY'S ADVENTURE</h2>
          <p>Loading your personalized schedule <span className="loading loading-dots loading-xs"></span></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 mt-24 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-2xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Today's Adventure</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="flex items-center justify-center text-red-500 mb-2">
              <AlertCircle size={18} className="mr-2" />
              <p className='text-sm'>{error}</p>
            </div>
            <p className="text-xs text-center">
              You can create a custom schedule by clicking the 'Create Schedule' button.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={createSchedule}
              className={`py-2 px-4 rounded-md transition-colors font-pixel ${
                  isCreatingSchedule 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              {isCreatingSchedule ? 'Creating Schedule...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Content */}
      <div className="flex-1 p-8 mt-24 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
          <div className="flex flex-row justify-between mb-4">
            <h2 className="text-2xl text-[#E6C86E] font-bold" style={{
              fontFamily: "'Press Start 2P', monospace",
              letterSpacing: "0.5px",
              textShadow: "2px 2px 0 #000"
            }}>Today's Adventure</h2>
            <div className="flex items-center text-sm text-gray-700">
              <Clock size={16} className="mr-1" />
              <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-3 ml-2">
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
              <div className="w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></div>
              <span>Current</span>
            </div>
          </div>

          {timelineHours.length > 0 ? (
            <>
              <div 
                ref={timelineRef}
                className="space-y-2 max-h-[350px] overflow-y-auto pr-2 relative mb-4"
              >
                {timelineHours.map((hour, index) => {
                  const activity = getActivityForHour(hour);
                  const isPast = isHourPast(hour);
                  const isCurrentHour = currentTime.getHours() === parseInt(hour);
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start px-2 py-1 rounded ${isCurrentHour ? 'bg-green-300/80' : ''}`}
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
                                  onClick={() => handleDeleteItem(activity.id)}
                                  className="text-gray-500 hover:text-red-500"
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
              <div className="flex justify-end pr-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-pixel"
                >
                  Add Adventure
                </button>
              </div>
            </>
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
              
              <div className="mb-3">
                <label className="flex items-center text-sm text-gray-600">
                  <input 
                    type="checkbox" 
                    checked={isTimeRange}
                    onChange={(e) => setIsTimeRange(e.target.checked)}
                    className="mr-2"
                  />
                  Use time range
                </label>
              </div>
              
              <div className={`grid ${isTimeRange ? 'grid-cols-2' : 'grid-cols-2'} gap-4 mb-4`}>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    {isTimeRange ? 'Start Time' : 'Time'}
                  </label>
                  <input 
                    type="time" 
                    value={newItemTime}
                    onChange={(e) => setNewItemTime(e.target.value)}
                    className={`w-full p-2 text-sm border rounded ${validationErrors.time ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.time && (
                    <p className="text-red-500 text-xs mt-1">Time is required</p>
                  )}
                </div>
                
                {isTimeRange && (
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">End Time</label>
                    <input 
                      type="time" 
                      value={newItemEndTime}
                      onChange={(e) => setNewItemEndTime(e.target.value)}
                      className="w-full p-2 text-sm border rounded"
                    />
                  </div>
                )}
                
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
                  className={`w-full p-2 text-sm border rounded ${validationErrors.activity ? 'border-red-500' : ''}`}
                  autoFocus
                />
                {validationErrors.activity && (
                  <p className="text-red-500 text-xs mt-1">Activity name is required</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleCloseModal}
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

      {/* Notification */}
      {notification.show && (
        <div className="absolute left-0 right-0 mx-auto w-3/4 max-w-2xl bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-up">
          <div className="flex items-start">
            <div className="mr-2 flex-shrink-0 h-5 w-5">⚠️</div>
            <div>
              <p>{notification.message}</p>
              <p className="text-sm mt-1">Check your Quests to manage it.</p>
            </div>
            <button 
              onClick={() => setNotification({ show: false, message: '' })}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodaySchedule;

<>
  <style jsx>{`
    .font-pixel {
      font-family: 'Press Start 2P', monospace;
      letter-spacing: 0.5px;
    }
    
    .pixel-shadow {
      text-shadow: 2px 2px 0 #000;
    }
  `}</style>

  <style jsx global>{`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out forwards;
    }
  `}</style>
</>

