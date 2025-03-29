"use client";

import React, { useState, useEffect, useRef } from 'react';
import CapybaraSkins from './CapybaraSkins';
import Image from 'next/image';

const themes = [
  { id: 'lofi', name: 'Lo-Fi Study', file: '/lofi.mp4', description: 'Relaxing lo-fi beats for studying and focusing', price: 0 },
  { id: 'lofi_city', name: 'Lo-Fi City', file: '/lofi_city.mp4', description: 'Urban cityscape with calming lo-fi music', price: 0 },
  { id: 'fire', name: 'Fireplace', file: '/fire.mp4', description: 'Cozy fireplace ambiance for relaxation', price: 0 },
  { id: 'rain', name: 'Rain Day', file: '/rain.mp4', description: 'Mario room chill vibe', price: 1 },
  { id: 'wave', name: 'Ocean Waves', file: '/wave.mp4', description: 'Calming ocean waves for a serene environment', price: 5 },
  { id: 'coffee', name: 'Coffee Shop', file: '/coffee.mp4', description: 'Coffee shop ambiance for productivity', price: 10 }
];

export default function ThemeSelector() {
  // Define text style for VT323 font
  const textStyle = {
    fontFamily: "'VT323', monospace",
    fontSize: "1.2rem",
    color: "#000000"
  };

  const [currentTheme, setCurrentTheme] = useState('lofi');
  const [previewTheme, setPreviewTheme] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRefs = useRef({});
  const previewVideoRef = useRef(null);
  const [unlockedThemes, setUnlockedThemes] = useState(['lofi', 'lofi_city', 'fire']);
  const [userCoins, setUserCoins] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  // Load the current theme and unlocked themes from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      localStorage.setItem('selectedTheme', 'lofi');
    }
    
    // Load unlocked themes
    const savedUnlockedThemes = localStorage.getItem('unlockedThemes');
    if (savedUnlockedThemes) {
      const parsedThemes = JSON.parse(savedUnlockedThemes);
      setUnlockedThemes(Array.isArray(parsedThemes) ? parsedThemes : ['lofi', 'lofi_city', 'fire']);
    } else {
      localStorage.setItem('unlockedThemes', JSON.stringify(['lofi', 'lofi_city', 'fire']));
    }
    
    // Fetch user coins
    fetchUserCoins();
    
    setIsLoaded(true);
  }, []);

  // Fetch user coins from the API
  const fetchUserCoins = async () => {
    try {
      const response = await fetch('/api/login-tracker');
      if (response.ok) {
        const data = await response.json();
        setUserCoins(data.coins);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

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
    const theme = themes.find(t => t.id === themeId);
    
    // Check if theme is unlocked or free
    if (unlockedThemes.includes(themeId) || theme.price === 0) {
      setPreviewTheme(themeId);
    } else {
      showMessage(`You need to unlock this theme first!`, 'error');
    }
  };

  const unlockTheme = async (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    
    if (unlockedThemes.includes(themeId)) {
      showMessage('You already own this theme!', 'info');
      return;
    }
    
    if (userCoins < theme.price) {
      showMessage(`Not enough coins! You need ${theme.price} coins.`, 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to update user's coin balance
      const response = await fetch('/api/coins/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: theme.price,
          item: `Theme: ${theme.name}`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase theme');
      }
      
      const data = await response.json();
      
      // Update local coin count
      setUserCoins(data.newBalance);
      
      // Update unlocked themes
      const newUnlockedThemes = [...unlockedThemes, themeId];
      setUnlockedThemes(newUnlockedThemes);
      
      // Save to localStorage
      localStorage.setItem('unlockedThemes', JSON.stringify(newUnlockedThemes));
      
      showMessage(`Successfully unlocked ${theme.name} theme!`, 'success');
      
      // Set as preview theme after unlocking
      setPreviewTheme(themeId);
    } catch (error) {
      console.error('Error unlocking theme:', error);
      showMessage(error.message || 'Failed to unlock theme. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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

  // Show message function
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="flex-1 p-8 mt-24 relative">
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

      {/* Scrollable container for both sections */}
      <div className="w-3/4 max-w-2xl mx-auto mt-8 max-h-[60vh] overflow-y-auto rounded-lg shadow-lg">
        {/* Theme Selection Section */}
        <div className="bg-white/70 backdrop-blur-sm p-4 mb-4 rounded-lg">
          <h2 className="text-xl text-[#E6C86E] font-bold mb-4" style={{
                fontFamily: "'Press Start 2P', monospace",
                letterSpacing: "0.5px",
                textShadow: "2px 2px 0 #000"
              }}>Choose Your Theme</h2>
          
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium" style={textStyle}>Your Coins:</p>
            <p className="font-bold text-yellow-500 flex items-center" style={textStyle}>
              <span className="text-xl">{userCoins}</span>
              <span className="ml-1 text-lg">
                <Image 
                  src="/coin.png" 
                  alt="Coin" 
                  width={20} 
                  height={20} 
                />
              </span>
            </p>
          </div>
          
          {message && (
            <div className={`mb-4 p-2 rounded text-sm ${
              messageType === 'success' ? 'bg-green-100 text-green-800' :
              messageType === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`} style={textStyle}>
              {message}
            </div>
          )}
            
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {themes.map((theme) => {
              const isUnlocked = unlockedThemes.includes(theme.id) || theme.price === 0;
              
              return (
                <div 
                  key={theme.id}
                  className={`
                    rounded-lg overflow-hidden border-2 transition-all
                    ${previewTheme === theme.id ? 'border-blue-500 shadow-lg' : 
                      currentTheme === theme.id ? 'border-green-500' : 'border-transparent hover:border-gray-300'}
                  `}
                >
                  <div 
                    className="relative h-24 cursor-pointer"
                    onClick={() => isUnlocked ? handleThemeSelect(theme.id) : null}
                  >
                    <video 
                      ref={el => videoRefs.current[theme.id] = el}
                      className={`absolute inset-0 w-full h-full object-cover ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseOver={() => safePlay(videoRefs.current[theme.id])}
                      onMouseOut={() => previewTheme !== theme.id && safePause(videoRefs.current[theme.id])}
                    >
                      <source src={theme.file} type="video/mp4" />
                    </video>
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex items-center bg-black/70 px-2 py-1 rounded text-white text-xs" style={textStyle}>
                          <span className="mr-1">{theme.price}</span>
                          <span>
                          <Image 
                            src="/coin.png" 
                            alt="Coin" 
                            width={20} 
                            height={20} 
                          />
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {currentTheme === theme.id && !previewTheme && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full" style={textStyle}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <h3 className="text-xs font-semibold" style={textStyle}>{theme.name}</h3>
                    <p className="text-xs text-gray-500 truncate" style={textStyle}>{theme.description}</p>
                    
                    <div className="mt-2">
                      {isUnlocked ? (
                        <button
                          onClick={() => handleThemeSelect(theme.id)}
                          className={`w-full text-xs px-2 py-1 rounded ${
                            currentTheme === theme.id && !previewTheme
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          style={textStyle}
                        >
                          {currentTheme === theme.id && !previewTheme ? 'Current' : 'Preview'}
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockTheme(theme.id)}
                          disabled={loading || userCoins < theme.price}
                          className={`flex items-center justify-center gap-2 w-full text-xs px-2 py-1 rounded ${
                            loading || userCoins < theme.price
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          style={textStyle}
                        >
                          {loading ? 'Processing...' : `Unlock`}
                          
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {previewTheme && (
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setPreviewTheme(null)}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                style={textStyle}
              >
                Cancel
              </button>
              <button 
                onClick={handleThemeApply}
                className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                style={textStyle}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Add CapybaraSkins component inside the scrollable container */}
        <CapybaraSkins />
      </div>
    </div>
  );
} 

