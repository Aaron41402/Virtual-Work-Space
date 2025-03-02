"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const themes = [
  { id: 'lofi', name: 'Lo-Fi Study', file: '/lofi.mp4', description: 'Relaxing lo-fi beats for studying and focusing' },
  { id: 'lofi_city', name: 'Lo-Fi City', file: '/lofi_city.mp4', description: 'Urban cityscape with calming lo-fi music' },
  { id: 'fire', name: 'Fireplace', file: '/fire.mp4', description: 'Cozy fireplace ambiance for relaxation' },
  { id: 'rain', name: 'Rainy Day', file: '/rain.mp4', description: 'Peaceful rain sounds for concentration' },
  { id: 'wave', name: 'Ocean Waves', file: '/wave.mp4', description: 'Calming ocean waves for a serene environment' },
  { id: 'coffee', name: 'Coffee Shop', file: '/coffee.mp4', description: 'Coffee shop ambiance for productivity' }
];

export default function ThemePage() {
  const [currentTheme, setCurrentTheme] = useState('lofi'); // Default to lofi
  const [previewTheme, setPreviewTheme] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRefs = useRef({});
  const previewVideoRef = useRef(null);
  const router = useRouter();

  // Load the current theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      // If no theme is set, set the default to lofi
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
      router.push('/dashboard');
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
      // Only play if the video is paused
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
      // Only pause if the video is playing
      if (!videoElement.paused) {
        videoElement.pause();
      }
    } catch (error) {
      console.log("Video pause error (safe to ignore):", error.message);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Video */}
      {isLoaded && (
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
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <Link 
        href="/dashboard" 
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-lg font-semibold text-gray-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        
      </Link>

      {isLoaded && (
        <div className="relative z-10 pt-16 px-8 pb-8 max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg mt-16 shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Choose Your Theme</h1>
            <p className="mb-6 text-gray-700">Select a video background theme for your dashboard experience.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`
                    cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${previewTheme === theme.id ? 'border-blue-500 shadow-lg scale-105' : 
                      currentTheme === theme.id ? 'border-green-500' : 'border-transparent hover:border-gray-300'}
                  `}
                >
                  <div className="relative h-40">
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
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Current
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {previewTheme && (
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setPreviewTheme(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleThemeApply}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Apply Theme
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 