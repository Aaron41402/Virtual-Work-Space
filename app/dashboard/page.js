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

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    </main>
  )
}

