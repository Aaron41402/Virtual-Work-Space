'use client'
import React, { useEffect, useState, useRef } from 'react'

export default function DashboardAudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const audioRef = useRef(null);
  const audioInitializedRef = useRef(false);
  
  // Initialize audio only once
  useEffect(() => {
    if (typeof window === 'undefined' || audioInitializedRef.current) return;
    
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
    
    audioInitializedRef.current = true;
  }, []); // Empty dependency array - run only once

  // Set up global audio controls
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.dashboardAudio = {
      toggleMute: () => {
        if (audioRef.current) {
          if (volume > 0) {
            // Muting
            setPreviousVolume(volume);
            setVolume(0);
            audioRef.current.volume = 0;
            setIsPlaying(false);
            
            // Pause the audio when muting
            audioRef.current.pause();
          } else {
            // Unmuting
            setVolume(previousVolume);
            audioRef.current.volume = previousVolume;
            setIsPlaying(true);
            
            // Resume playback
            audioRef.current.play().catch(e => console.log('Play on unmute failed:', e));
          }
          localStorage.setItem('musicEnabled', (volume === 0).toString());
        }
      },
      handleVolumeChange: (newVolume) => {
        // Just update the volume without affecting playback
        setVolume(newVolume);
        if (newVolume > 0) {
          setPreviousVolume(newVolume);
        }
        
        if (audioRef.current) {
          audioRef.current.volume = newVolume;
          localStorage.setItem('musicVolume', newVolume.toString());
          
          // Handle mute/unmute state
          if (newVolume === 0 && isPlaying) {
            setIsPlaying(false);
            audioRef.current.pause();
            localStorage.setItem('musicEnabled', 'false');
          } else if (newVolume > 0 && !isPlaying) {
            setIsPlaying(true);
            audioRef.current.play().catch(e => console.log('Play on volume change failed:', e));
            localStorage.setItem('musicEnabled', 'true');
          }
        }
      },
      getVolume: () => volume,
      getIsPlaying: () => isPlaying,
      getVolumeIcon: () => {
        if (volume === 0) return '🔇';
        if (volume < 0.3) return '🔈';
        if (volume < 0.7) return '🔉';
        return '🔊';
      }
    };
    
    return () => {
      delete window.dashboardAudio;
    };
  }, [volume, previousVolume, isPlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return children;
} 