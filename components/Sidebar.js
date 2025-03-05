'use client'
import Link from 'next/link'
import ButtonLogout from './ButtonLogout'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [volumeIcon, setVolumeIcon] = useState('🔊');
  
  useEffect(() => {
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

  // Get user's name or email
  const userName = session?.user?.name || 
                  (session?.user?.email ? session.user.email.split('@')[0] : 'Adventurer');
  
  // Get user's avatar URL
  const userAvatar = session?.user?.image || 'https://via.placeholder.com/64';

  return (
    <div className="w-64 bg-gray-800/90 text-white p-6 flex flex-col justify-between relative z-10">
      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white bg-clip-text">
          VirtualWorkSpace
        </h1>
      </div>
      
      {/* User Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="avatar mb-4">
          <div className="w-20 h-20 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2 overflow-hidden">
            <img src={userAvatar} alt={userName} />
          </div>
        </div>
        <h3 className="text-lg font-semibold">{userName}</h3>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 flex justify-center">
        <nav className="space-y-4 w-full max-w-[180px]">
          <Link href="/dashboard" className="block hover:bg-gray-700 p-2 rounded text-left">
            🏠 Home
          </Link>
          <Link href="/dashboard/analysis" className="block hover:bg-gray-700 p-2 rounded text-left">
            📈 Analysis
          </Link>
          <Link href="/dashboard/todo" className="block hover:bg-gray-700 p-2 rounded text-left">
            📝 To Do
          </Link>
          <Link href="/dashboard/pomodoro" className="block hover:bg-gray-700 p-2 rounded text-left">
            🍅 Pomodoro
          </Link>
          <Link href="/dashboard/theme" className="block hover:bg-gray-700 p-2 rounded text-left">
            🖼️ Theme
          </Link>
        </nav>
      </div>

      {/* Audio Controls and Logout */}
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
  );
} 