'use client'
import Link from 'next/link'
import ButtonLogout from './ButtonLogout'
import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

export default function Sidebar({ activeSection, setActiveSection }) {
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);
  
  // Music tracks
  const musicTracks = [
    { id: 1, name: "Music 0", file: "/music0.mp3" },
    { id: 2, name: "Music 1", file: "/music1.mp3" },
    { id: 3, name: "Music 2", file: "/music2.mp3" },
    { id: 4, name: "Music 3", file: "/music3.mp3" },
    { id: 5, name: "Music 4", file: "/music4.mp3" },
  ];
  
  // Define nextTrack as a regular function to avoid dependency issues
  const nextTrack = () => {
    if (!audioRef.current) return;
    
    const newIndex = (currentTrackIndex + 1) % musicTracks.length;
    console.log(`Moving to next track: ${newIndex}`);
    
    // Change track
    audioRef.current.src = musicTracks[newIndex].file;
    setCurrentTrackIndex(newIndex);
    
    // If it was playing before, continue playing
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error('Auto-play next failed:', e));
      }
    }
  };
  
  // Initialize audio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create new audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(musicTracks[0].file);
      audioRef.current.loop = false;
      audioRef.current.volume = 0.5;
      
      console.log('Audio element initialized');
    }
    
    // Function to handle when track ends
    const handleTrackEnded = () => {
      console.log('Track ended event fired');
      nextTrack();
    };
    
    // Add event listener
    audioRef.current.addEventListener('ended', handleTrackEnded);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        console.log('Cleaning up audio element');
        audioRef.current.removeEventListener('ended', handleTrackEnded);
      }
    };
  }, [currentTrackIndex]); // Only re-run when currentTrackIndex changes
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error('Play failed:', e);
          // Try to recover by reloading the audio
          audioRef.current.load();
          audioRef.current.play().catch(e => console.error('Retry play failed:', e));
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Previous track
  const previousTrack = () => {
    if (!audioRef.current) return;
    
    const newIndex = currentTrackIndex === 0 ? musicTracks.length - 1 : currentTrackIndex - 1;
    console.log(`Moving to previous track: ${newIndex}`);
    
    // Change track
    audioRef.current.src = musicTracks[newIndex].file;
    setCurrentTrackIndex(newIndex);
    
    // If it was playing before, continue playing
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error('Play previous failed:', e));
      }
    }
  };
  
  // Get user's name or email
  const userName = session?.user?.name || 
                  (session?.user?.email ? session.user.email.split('@')[0] : 'Adventurer');
  
  // Get user's avatar URL
  const userAvatar = session?.user?.image || 'https://via.placeholder.com/64';

  const navigationItems = [
    { id: 'home', label: '🏠 Adventure', type: 'section' },
    { id: 'todo', label: '📝 Quests', type: 'section' },
    { id: 'analysis', label: '📈 Analysis', type: 'section' },
    { id: 'theme', label: '🖼️ Themes', type: 'section' },
  ];

  return (
    <>
      <div className="w-64 bg-[#2A2136] text-white p-6 flex flex-col justify-between relative z-50 border-r-4 border-[#E6C86E] font-pixel">
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
        </div>

        {/* Music Player */}
        <div className="mt-auto mb-4 space-y-4">
          <div className="bg-[#3A2E56] p-3 border-2 border-[#E6C86E] rounded-md shadow-lg">
            <h4 className="text-[#E6C86E] text-sm font-bold mb-2 text-center"></h4>
            
            {/* Music Player Animation */}
            <div className="flex justify-center mb-3">
              {isPlaying ? (
                <div className="music-player-animation">
                  <Image 
                    src="/musicPlayer.gif" 
                    alt="Music playing" 
                    width={160} 
                    height={180} 
                    className="pixel-image"
                  />
                </div>
              ) : (
                <div className="music-player-static">
                  <div className="pixel-music-icon">
                    <div className="music-note">♪</div>
                    
                  </div>
                </div>
              )}
            </div>
            
            {/* Music Controls */}
            <div className="flex justify-between items-center">
              <button 
                onClick={previousTrack}
                className="w-8 h-8 flex items-center justify-center bg-[#2A2136] text-[#8BABBF] border border-[#8BABBF] rounded-full hover:text-[#E6C86E] hover:border-[#E6C86E]"
                aria-label="Previous track"
              >
                ⏮
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-[#2A2136] text-[#E6C86E] border-2 border-[#E6C86E] rounded-full hover:bg-[#4A3F6B]"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              
              <button 
                onClick={nextTrack}
                className="w-8 h-8 flex items-center justify-center bg-[#2A2136] text-[#8BABBF] border border-[#8BABBF] rounded-full hover:text-[#E6C86E] hover:border-[#E6C86E]"
                aria-label="Next track"
              >
                ⏭
              </button>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="pixel-container" style={{ position: 'relative', zIndex: 999 }}>
            <ButtonLogout />
          </div>
        </div>
        
        <style jsx global>{`          @font-face {
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
          
          /* Remove vinyl record styles */
          .vinyl-record {
            display: none;
          }
          
          /* Music player animation styles */
          .music-player-animation {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 160px;
            height: 180px;
            margin-top: 4px;
            margin-bottom: 6px;
          }
          
          .music-player-static {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 160px;
            height: 180px;
            margin-top: 2px;
            margin-bottom: 6px;
          }
          
          .pixel-music-icon {
            width: 160px;
            height: 180px;
            background-color: #2A2136;
            border: 2px solid #8BABBF;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          
          .music-note {
            font-size: 32px;
            color: #E6C86E;
            text-shadow: 2px 2px 0 #000;
          }
          
          
        `}</style>
      </div>
    </>
  );
} 
