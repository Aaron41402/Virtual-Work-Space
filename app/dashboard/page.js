'use client'
import ButtonLogout from '@/components/ButtonLogout'
import TodaySchedule from '@/components/TodaySchedule'
import VideoBackground from '@/components/VideoBackground'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import AIAssistant from '@/components/AIAssistant'

export default function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [volumeIcon, setVolumeIcon] = useState('🔊');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Sync with global audio state if available
    if (typeof window !== 'undefined' && window.dashboardAudio) {
      setIsPlaying(window.dashboardAudio.getIsPlaying());
      setVolume(window.dashboardAudio.getVolume());
      setVolumeIcon(window.dashboardAudio.getVolumeIcon());
      
      // Set up an interval to periodically check for changes
      const intervalId = setInterval(() => {
        if (window.dashboardAudio) {
          setIsPlaying(window.dashboardAudio.getIsPlaying());
          setVolume(window.dashboardAudio.getVolume());
          setVolumeIcon(window.dashboardAudio.getVolumeIcon());
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (typeof window !== 'undefined' && window.dashboardAudio) {
      window.dashboardAudio.handleVolumeChange(newVolume);
    }
  };

  const toggleMute = () => {
    if (typeof window !== 'undefined' && window.dashboardAudio) {
      window.dashboardAudio.toggleMute();
    }
  };

  return (
    <main className="flex min-h-screen relative overflow-hidden">
      <VideoBackground />

      {/* Sidebar */}
      <div className="w-64 bg-gray-800/90 text-white p-6 flex flex-col justify-between relative z-10">
        <div>
          <h2 className="text-xl font-bold mb-6">Dashboard</h2>
          <nav className="space-y-4">
            <Link href="/dashboard/analysis" className="block hover:bg-gray-700 p-2 rounded">
            📈 Analysis
            </Link>
            <Link href="/dashboard/todo" className="block hover:bg-gray-700 p-2 rounded">
            📝 To Do
            </Link>
            <Link href="/dashboard/pomodoro" className="block hover:bg-gray-700 p-2 rounded">
            🍅 Pomodoro
            </Link>
            <Link href="/dashboard/theme" className="block hover:bg-gray-700 p-2 rounded">
            🖼️ Theme
            </Link>
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded hover:bg-gray-600"
            >
              {volumeIcon}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <ButtonLogout />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <TodaySchedule />
        
        {/* Position AIAssistant at the bottom */}
        <div className="mt-auto">
          {isMounted && <AIAssistant />}
        </div>
      </div>

      {/* <script src="https://cdn.botpress.cloud/webchat/v2.2/inject.js"></script>
      <script src="https://files.bpcontent.cloud/2025/02/28/19/20250228192050-G6ZM6L05.js"></script>
     */}
    </main>
  )
}

