'use client'
import TodaySchedule from '@/components/TodaySchedule'
import VideoBackground from '@/components/VideoBackground'
import React, { useEffect, useState } from 'react'
import AIAssistant from '@/components/AIAssistant'
import Sidebar from '@/components/Sidebar'
import UserAnalysis from '@/components/User_Analysis'
import ToDoList from '@/components/ToDoList'
// import Pomodoro from '@/components/Pomodoro'
// import ThemeSelector from '@/components/ThemeSelector'

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
      // case 'pomodoro':
      //   return <Pomodoro />;
      // case 'theme':
      //   return <ThemeSelector />;
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
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        {renderContent()}
        
        {/* Position AIAssistant at the bottom */}
        <div className="mt-auto">
          {isMounted && <AIAssistant />}
        </div>
      </div>
    </main>
  )
}

