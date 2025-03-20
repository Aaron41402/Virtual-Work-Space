'use client'
import TodaySchedule from '@/components/TodaySchedule'
import VideoBackground from '@/components/VideoBackground'
import React, { useEffect, useState } from 'react'
import AIAssistant from '@/components/AIAssistant'
import Sidebar from '@/components/Sidebar'
import UserAnalysis from '@/components/UserAnalysis'
import ToDoList from '@/components/ToDoList'
import ThemeSelector from '@/components/ThemeSelector'
import CapybaraPomodoro from '@/components/CapybaraPomodoro'
import LoginTracker from '@/components/LoginTracker'
import LoginReminder from '@/components/LoginReminder'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    setIsMounted(true);
    fetchTasks();
    checkAndUpdateAnalysis();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task');
      const data = await response.json();
      
      if (data.tasks) {
        // Get yesterday's date at midnight
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Filter out old completed tasks and get their IDs
        const tasksToDelete = data.tasks.filter(task => 
          task.status === 'Completed' && 
          new Date(task.updatedAt) < yesterday
        ).map(task => task._id);

        // Delete old completed tasks if any exist
        if (tasksToDelete.length > 0) {
          await fetch(`/api/task?ids=${tasksToDelete.join(',')}`, {
            method: 'DELETE',
          });
        }

        // Filter tasks for localStorage
        const currentTasks = data.tasks.filter(task => 
          task.status !== 'Completed' || 
          new Date(task.updatedAt) >= yesterday
        );

        localStorage.setItem('tasks', JSON.stringify(currentTasks));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const checkAndUpdateAnalysis = async () => {
    const analysisData = localStorage.getItem('analysis');
    
    // Get yesterday's date in YYYY-MM-DD format in local timezone
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const tasksData = localStorage.getItem('tasks');
    const scheduleData = localStorage.getItem('scheduleData');

    if (!analysisData || JSON.parse(analysisData).date !== yesterdayStr) {
      try {
        const tasks = tasksData ? JSON.parse(tasksData) : [];
        const schedule = scheduleData ? JSON.parse(scheduleData) : [];

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'analysis',
            data: { tasks, schedule }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${data.error || 'Unknown error'}`);
        }
        
        if (!data.response) {
          throw new Error('No response text in analysis data');
        }

        const newAnalysis = {
          date: yesterdayStr,
          report: data.response,
          efficiencyScore: data.efficiencyScore || 0,
          tasksCompleted: data.tasksCompleted || 0
        };

        localStorage.setItem('analysis', JSON.stringify(newAnalysis));
      } catch (error) {
        console.error('Error generating analysis:', error);
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <TodaySchedule />;
      case 'analysis':
        return <UserAnalysis />;
      case 'todo':
        return <ToDoList />;
      case 'theme':
        return <ThemeSelector />;
      default:
        return <TodaySchedule />;
    }
  };

  return (
    <main className="flex min-h-screen relative overflow-hidden">
      <VideoBackground />

      {/* Sidebar with user avatar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6 relative">
        {/* Position CapybaraPomodoro at the top level so it appears on all pages */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center">
          <CapybaraPomodoro />
        </div>
        
        {/* Login Tracker in top right corner */}
        <div className="absolute top-4 right-4 z-20">
          {isMounted && <LoginTracker />}
        </div>
        
        {renderContent()}
        
        {/* Position AIAssistant at the bottom */}
        <div className="mt-auto">
          {isMounted && <AIAssistant />}
        </div>
      </div>
      
      {/* Login reminder popup */}
      {isMounted && <LoginReminder />}
    </main>
  )
}

