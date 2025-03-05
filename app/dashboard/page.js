'use client'
import TodaySchedule from '@/components/TodaySchedule'
import VideoBackground from '@/components/VideoBackground'
import React, { useEffect, useState } from 'react'
import AIAssistant from '@/components/AIAssistant'
import Sidebar from '@/components/Sidebar'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="flex min-h-screen relative overflow-hidden">
      <VideoBackground />

      {/* Sidebar with user avatar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <TodaySchedule />
        
        {/* Position AIAssistant at the bottom */}
        <div className="mt-auto">
          {isMounted && <AIAssistant />}
        </div>
      </div>
    </main>
  )
}

