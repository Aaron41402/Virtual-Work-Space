"use client";

import React, { useState, useEffect, useRef } from 'react';

const themes = [
  { id: 'lofi', name: 'Lo-Fi Study', file: '/lofi.mp4', description: 'Relaxing lo-fi beats for studying and focusing' },
  { id: 'lofi_city', name: 'Lo-Fi City', file: '/lofi_city.mp4', description: 'Urban cityscape with calming lo-fi music' },
  { id: 'fire', name: 'Fireplace', file: '/fire.mp4', description: 'Cozy fireplace ambiance for relaxation' },
  { id: 'rain', name: 'Rainy Day', file: '/rain.mp4', description: 'Peaceful rain sounds for concentration' },
  { id: 'wave', name: 'Ocean Waves', file: '/wave.mp4', description: 'Calming ocean waves for a serene environment' },
  { id: 'coffee', name: 'Coffee Shop', file: '/coffee.mp4', description: 'Coffee shop ambiance for productivity' }
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('lofi');
  const [previewTheme, setPreviewTheme] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRefs = useRef({});
  const previewVideoRef = useRef(null);

  // Load the current theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      localStorage.setItem('selectedTheme', 'lofi');
    }
    setIsLoaded(true);
  }, []);

  // Effect to handle preview video loading
  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.load();
      previewVideoRef.current.play().catch(err => {
        console.log("Preview video play error (safe to ignore):", err.message);
      });
    }
  }, [previewTheme, currentTheme, isLoaded]);

  const handleThemeSelect = (themeId) => {
    setPreviewTheme(themeId);
  };

  const handleThemeApply = () => {
    if (previewTheme) {
      localStorage.setItem('selectedTheme', previewTheme);
      setCurrentTheme(previewTheme);
      window.location.reload();
    }
  };

  // Get the current video file to display (preview or current)
  const getDisplayTheme = () => {
    return previewTheme || currentTheme;
  };

  // Get the video file path for the current display theme
  const getDisplayVideoPath = () => {
    const themeId = getDisplayTheme();
    return themes.find(t => t.id === themeId)?.file || '/lofi.mp4';
  };

  // Safe play function with error handling
  const safePlay = async (videoElement) => {
    if (!videoElement) return;
    try {
      if (videoElement.paused) {
        await videoElement.play();
      }
    } catch (error) {
      console.log("Video play error (safe to ignore):", error.message);
    }
  };

  // Safe pause function with error handling
  const safePause = (videoElement) => {
    if (!videoElement) return;
    try {
      if (!videoElement.paused) {
        videoElement.pause();
      }
    } catch (error) {
      console.log("Video pause error (safe to ignore):", error.message);
    }
  };

  return (
    <div className="flex-1 m-8 relative">
      {/* Background Video Preview */}
      {isLoaded && previewTheme && (
        <div className="fixed inset-0 z-0">
          <video
            ref={previewVideoRef}
            key={`display-${getDisplayTheme()}`}
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover"
          >
            <source src={getDisplayVideoPath()} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
      <h2 className="text-xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Choose Your Theme</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {themes.map((theme) => (
            <div 
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`
                cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                ${previewTheme === theme.id ? 'border-blue-500 shadow-lg' : 
                  currentTheme === theme.id ? 'border-green-500' : 'border-transparent hover:border-gray-300'}
              `}
            >
              <div className="relative h-24">
                <video 
                  ref={el => videoRefs.current[theme.id] = el}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseOver={() => safePlay(videoRefs.current[theme.id])}
                  onMouseOut={() => previewTheme !== theme.id && safePause(videoRefs.current[theme.id])}
                >
                  <source src={theme.file} type="video/mp4" />
                </video>
                {currentTheme === theme.id && !previewTheme && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                    ✓
                  </div>
                )}
              </div>
              <div className="p-2 bg-white">
                <h3 className="text-xs font-semibold">{theme.name}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {previewTheme && (
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setPreviewTheme(null)}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleThemeApply}
              className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .font-pixel {
          font-family: 'Press Start 2P', monospace;
          letter-spacing: 0.5px;
        }
        
        .pixel-shadow {
          text-shadow: 2px 2px 0 #000;
        }
      `}</style>
    </div>
  );
} 

