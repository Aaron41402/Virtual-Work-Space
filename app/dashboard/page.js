'use client'
import ButtonLogout from '@/components/ButtonLogout'
import TodaySchedule from '@/components/TodaySchedule'
import VideoBackground from '@/components/VideoBackground'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'

export default function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5); // Store previous volume for unmuting
  const audioRef = useRef(null);

  useEffect(() => {
    const storedPreference = localStorage.getItem('musicEnabled');
    const storedVolume = localStorage.getItem('musicVolume');
    const shouldPlay = storedPreference === null ? true : storedPreference === 'true';
    const savedVolume = storedVolume ? parseFloat(storedVolume) : 0.5;
    
    setIsPlaying(shouldPlay);
    setVolume(shouldPlay ? savedVolume : 0);
    setPreviousVolume(savedVolume);

    audioRef.current = new Audio('/default.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = shouldPlay ? savedVolume : 0;

    if (shouldPlay) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play failed:', error);
          const handleFirstClick = () => {
            audioRef.current.play().catch(e => console.log('Play on click failed:', e));
            document.removeEventListener('click', handleFirstClick);
          };
          document.addEventListener('click', handleFirstClick);
        });
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      localStorage.setItem('musicVolume', newVolume.toString());
      setIsPlaying(newVolume > 0);
      localStorage.setItem('musicEnabled', (newVolume > 0).toString());
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (volume > 0) {
        // Muting
        setPreviousVolume(volume);
        setVolume(0);
        audioRef.current.volume = 0;
      } else {
        // Unmuting
        setVolume(previousVolume);
        audioRef.current.volume = previousVolume;
      }
      const newState = volume === 0;
      setIsPlaying(newState);
      localStorage.setItem('musicEnabled', newState.toString());
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
              {volume === 0 ? '🔇' : volume < 0.3 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
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

      {/* Replace the static schedule with the TodaySchedule component */}
      <TodaySchedule />

      <script src="https://cdn.botpress.cloud/webchat/v2.2/inject.js"></script>
      <script src="https://files.bpcontent.cloud/2025/02/28/19/20250228192050-G6ZM6L05.js"></script>
    
    </main>
  )
}

