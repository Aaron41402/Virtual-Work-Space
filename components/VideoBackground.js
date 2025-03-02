'use client'

import React, { useState, useEffect } from 'react'

export default function VideoBackground() {
  const [theme, setTheme] = useState('lofi'); // Default theme
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get theme from localStorage on client side
    try {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Map of theme IDs to video files - using direct paths that we know work
  const themeFiles = {
    lofi: '/lofi.mp4',
    lofi_city: '/lofi_city.mp4',
    fire: '/fire.mp4',
    rain: '/rain.mp4',
    wave: '/wave.mp4',
    coffee: '/coffee.mp4'
  };

  const videoFile = themeFiles[theme] || '/lofi.mp4';

  return (
    <>
      {/* Fallback background color */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
      
      {isLoaded && (
        <video
          key={videoFile} // Add key to force re-render when video changes
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
          onError={(e) => console.error("Video error:", e.target.error || "Unknown video error")}
          onLoadedData={() => console.log("Video loaded successfully:", videoFile)}
        >
          <source src={videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      <div className="absolute inset-0 bg-black/30"></div>
    </>
  )
} 