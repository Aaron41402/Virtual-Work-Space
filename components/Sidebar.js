'use client'
import Link from 'next/link'
import ButtonLogout from './ButtonLogout'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Pomodoro from './Pomodoro'
import Image from 'next/image'

export default function Sidebar({ activeSection, setActiveSection }) {
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

  const navigationItems = [
    { id: 'home', label: '🏠 Journey', type: 'section' },
    { id: 'analysis', label: '📈 Analysis', type: 'section' },
    { id: 'todo', label: '📝 Quests', type: 'section' },
    { id: 'theme', label: '🖼️ Themes', type: 'section' },
  ];

  return (
    <div className="w-64 bg-[#2A2136] text-white p-6 flex flex-col justify-between relative z-10 border-r-4 border-[#E6C86E] font-pixel">
      {/* Logo */}
      <div className="text-center mb-6 flex items-center justify-center">
        <Image 
          src="/favicon.ico" 
          alt="TaskHero Logo" 
          width={24} 
          height={24} 
          className="mr-2"
        />
        <h1 className="text-2xl font-bold text-[#E6C86E] bg-clip-text pixel-shadow">
          TaskHero
        </h1>
      </div>
      
      {/* User Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="avatar mb-4 z-10">
          <div className="w-20 h-20 rounded-none border-4 border-[#E6C86E] overflow-hidden pixel-shadow">
            <img src={userAvatar} alt={userName} className="pixel-image" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[#E6C86E] pixel-shadow max-w-[160px] truncate text-center">
          {userName}
        </h3>
        {/* Show tooltip on hover if username is long */}
        {userName.length > 15 && (
          <div className="text-xs text-[#8BABBF] mt-1 opacity-80">
            Hover to see full name
          </div>
        )}
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 flex flex-col">
        <nav className="space-y-4 w-full max-w-[180px] mx-auto">
          {navigationItems.map((item) => (
            item.type === 'section' ? (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`block w-full font-bold text-left p-2 border-2 ${
                  activeSection === item.id 
                    ? 'bg-[#4A3F6B] border-[#FF6B97] text-[#FF6B97]' 
                    : 'hover:bg-[#3A2E56] border-[#8BABBF] text-[#8BABBF] hover:text-[#E6C86E] hover:border-[#E6C86E]'
                } pixel-button`}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="block w-full text-left p-2 border-2 border-[#8BABBF] text-[#8BABBF] hover:bg-[#3A2E56] hover:text-[#E6C86E] hover:border-[#E6C86E] pixel-button"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
        
        {/* Pomodoro Timer */}
        <div className="mt-6 w-full max-w-[180px] mx-auto bg-[#2A2136] border-2 border-[#8BABBF] pixel-container">
          <Pomodoro />
        </div>
      </div>

      {/* Audio Controls and Logout */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center space-x-2 border-2 border-[#8BABBF] p-2 pixel-container">
          <button
            onClick={toggleMute}
            className="p-2 rounded-none hover:bg-[#3A2E56] text-[#E6C86E]"
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
            className="flex-1 h-2 bg-[#4A3F6B] appearance-none cursor-pointer pixel-slider"
          />
        </div>
        <div className="pixel-container">
          <ButtonLogout />
        </div>
      </div>
      
      <style jsx global>{`
        @font-face {
          font-family: 'PixelFont';
          src: url('/fonts/PressStart2P-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        .font-pixel {
          font-family: 'PixelFont', monospace;
          letter-spacing: 0.5px;
        }
        
        .pixel-shadow {
          text-shadow: 2px 2px 0 #000;
        }
        
        .pixel-button {
          image-rendering: pixelated;
          transition: all 0.1s ease;
          box-shadow: 3px 3px 0 #000;
          position: relative;
          overflow: hidden;
          border-style: solid;
        }
        
        .pixel-button:after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: #2A2136;
          bottom: 0;
          right: 0;
          z-index: 2;
        }
        
        .pixel-button:hover:before {
          left: 100%;
        }
        
        .pixel-button:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 #000;
        }
        
        .pixel-button:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 #000;
        }
        
        .pixel-container {
          box-shadow: 4px 4px 0 #000;
          border: 2px solid #8BABBF;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .pixel-container:after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: #2A2136;
          bottom: 0;
          right: 0;
          z-index: 2;
        }
        
        .pixel-container:hover {
          box-shadow: 5px 5px 0 #000;
          transform: translateY(-1px);
        }
        
        .pixel-image {
          image-rendering: pixelated;
          transition: all 0.3s ease;
        }
        
        .pixel-image:hover {
          transform: scale(1.05);
        }
        
        .pixel-slider {
          height: 10px;
          border: 2px solid #000;
        }
        
        .pixel-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          background: #E6C86E;
          border: 2px solid #000;
          image-rendering: pixelated;
          box-shadow: 2px 2px 0 #000;
          cursor: pointer;
        }
        
        .pixel-slider::-webkit-slider-thumb:active {
          box-shadow: 1px 1px 0 #000;
          transform: translate(1px, 1px);
        }
        
        /* Pixel-perfect shadow animation for the logo */
        @keyframes pulse-shadow {
          0% { text-shadow: 2px 2px 0 #000; }
          50% { text-shadow: 3px 3px 0 #000; }
          100% { text-shadow: 2px 2px 0 #000; }
        }
        
        h1.pixel-shadow {
          animation: pulse-shadow 2s infinite;
        }
        
        /* Pixelated border animation */
        @keyframes border-pulse {
          0% { border-color: #E6C86E; }
          50% { border-color: #FF6B97; }
          100% { border-color: #E6C86E; }
        }
        
        .avatar > div {
          animation: border-pulse 4s infinite;
          image-rendering: pixelated;
        }
        
        h3.truncate:hover {
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          word-break: break-word;
          max-width: 160px;
          position: relative;
          z-index: 20;
          background-color: rgba(42, 33, 54, 0.9);
          padding: 2px 4px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
} 