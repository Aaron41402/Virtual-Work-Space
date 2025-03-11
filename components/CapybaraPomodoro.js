'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Play, Pause, RefreshCw, X } from 'lucide-react'
import Image from 'next/image'

export default function CapybaraPomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work' or 'break'
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [capybaraState, setCapybaraState] = useState('sleep') // 'sleep', 'idle', 'walk'

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval)
            playAlarm() // Play sound when timer reaches zero
            
            // Switch modes after timer completes
            const nextMode = mode === 'work' ? 'break' : 'work'
            setMode(nextMode)
            setMinutes(nextMode === 'work' ? 25 : 5)
            setSeconds(0)
            setCapybaraState('idle') // Reset to idle when timer completes
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, minutes, seconds, mode])

  // Update capybara state based on timer status
  useEffect(() => {
    if (isActive) {
      setCapybaraState('walk')
    } else if (showPomodoro) {
      setCapybaraState('idle')
    } else {
      setCapybaraState('sleep')
    }
  }, [isActive, showPomodoro])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode('work')
    setMinutes(25)
    setSeconds(0)
    setCapybaraState('idle')
  }
  
  // Play notification sound
  const playAlarm = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.7 // Set volume to 70%
      const playPromise = audio.play()
      
      // Handle potential play() promise rejection (browser policy)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play failed:", error)
        })
      }
    } catch (error) {
      console.error("Error playing notification:", error)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const togglePomodoro = () => {
    setShowPomodoro(!showPomodoro)
    if (!showPomodoro) {
      setCapybaraState('idle')
    } else {
      setIsActive(false)
      setCapybaraState('sleep')
    }
  }

  // Get the appropriate capybara GIF based on state
  const getCapybaraGif = () => {
    switch (capybaraState) {
      case 'sleep':
        return '/Capybara_sleep_left.gif'
      case 'idle':
        return '/Capybara_idle_relax.gif'
      case 'walk':
        return '/Capybara_walk_left.gif'
      default:
        return '/Capybara_sleep_left.gif'
    }
  }

  return (
    <div className="capybara-pomodoro-container">
      {/* Capybara Image */}
      <div 
        className={`capybara-image ${showPomodoro ? 'with-pomodoro' : ''}`}
        onClick={togglePomodoro}
      >
        <Image 
          src={getCapybaraGif()} 
          alt="Capybara" 
          width={80} 
          height={80} 
          className="pixel-image cursor-pointer"
        />
      </div>

      {/* Pomodoro Timer */}
      {showPomodoro && (
        <div className="pomodoro-container bg-[#2A2136] border-2 border-[#8BABBF] pixel-container">
          {/* Header with title */}
          <div className="p-2 flex justify-between items-center bg-[#4A3F6B] border-b-2 border-[#8BABBF]">
            <div className="flex items-center">
              <Image 
                src="/Capybara_static_left.png" 
                alt="Capybara" 
                width={24} 
                height={24} 
                className="mr-2 pixel-image"
              />
              <span className="font-medium text-[#ffffff] text-sm font-pixel">Capydoro</span>
            </div>
            <div className="flex">
              <button 
                className="text-[#8BABBF] hover:text-[#E6C86E] mr-2"
                onClick={toggleExpand}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button 
                className="text-[#8BABBF] hover:text-[#E6C86E]"
                onClick={togglePomodoro}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Timer display (always visible and bigger) */}
          <div className="py-3 px-2 flex justify-center bg-[#3A2E56]">
            <div className="timer-display font-bold tracking-wider text-[#E6C86E] pixel-shadow font-pixel">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          {/* Expanded controls */}
          {isExpanded && (
            <div className="p-2 border-t-2 border-[#8BABBF] bg-[#3A2E56]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-right text-[#8BABBF] font-pixel">
                  {mode === 'work' ? 'Work Time' : 'Break Time'}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={toggleTimer}
                    className="p-1 border border-[#8BABBF] hover:bg-[#4A3F6B] hover:border-[#E6C86E] pixel-button-sm"
                  >
                    {isActive ? <Pause color="white" size={14} /> : <Play color="white" size={14} />}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="p-1 border border-[#8BABBF] hover:bg-[#4A3F6B] hover:border-[#E6C86E] pixel-button-sm"
                  >
                    <RefreshCw color="white" size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMode('work')
                    setMinutes(25)
                    setSeconds(0)
                    setIsActive(false)
                    setCapybaraState('idle')
                  }}
                  className={`px-2 py-1 text-xs border-2 font-pixel ${
                    mode === 'work'
                      ? 'bg-[#4A3F6B] border-[#E6C86E] text-[#E6C86E]'
                      : 'bg-[#2A2136] border-[#8BABBF] text-[#8BABBF] hover:border-[#E6C86E] hover:text-[#E6C86E]'
                  } pixel-button-sm`}
                >
                  Work (25m)
                </button>
                <button
                  onClick={() => {
                    setMode('break')
                    setMinutes(5)
                    setSeconds(0)
                    setIsActive(false)
                    setCapybaraState('idle')
                  }}
                  className={`px-2 py-1 text-xs border-2 font-pixel ${
                    mode === 'break'
                      ? 'bg-[#4A3F6B] border-[#E6C86E] text-[#E6C86E]'
                      : 'bg-[#2A2136] border-[#8BABBF] text-[#8BABBF] hover:border-[#E6C86E] hover:text-[#E6C86E]'
                  } pixel-button-sm`}
                >
                  Break (5m)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .capybara-pomodoro-container {
          position: absolute;
          top: 120px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        
        .capybara-image {
          transition: all 0.3s ease;
          filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.7));
          image-rendering: pixelated;
        }
        
        .capybara-image.with-pomodoro {
          margin-right: 10px;
        }
        
        .pomodoro-container {
          width: 250px;
          box-shadow: 4px 4px 0 #000;
          top: -60px;
          position: relative;
          image-rendering: pixelated;
          border-width: 4px;
          border-style: solid;
          border-color: #8BABBF;
          border-radius: 0;
        }
        
        .pomodoro-container:after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: #2A2136;
          bottom: 0;
          right: 0;
          z-index: 2;
        }
        
        .pixel-button-sm {
          image-rendering: pixelated;
          transition: all 0.1s ease;
          box-shadow: 2px 2px 0 #000;
          position: relative;
          border-width: 2px;
          border-style: solid;
          border-radius: 0;
          font-family: 'PixelFont', monospace;
          letter-spacing: 0.5px;
        }
        
        .pixel-button-sm:after {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background-color: #2A2136;
          bottom: 0;
          right: 0;
          z-index: 2;
        }
        
        .pixel-button-sm:hover {
          transform: translateY(-1px);
          box-shadow: 3px 3px 0 #000;
        }
        
        .pixel-button-sm:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 #000;
        }
        
        .pixel-shadow {
          text-shadow: 4px 4px 0 #000;
          font-family: 'PixelFont', monospace;
          letter-spacing: 1px;
        }
        
        
        .timer-display {
          font-size: 2rem !important;
          line-height: 1.2 !important;
          padding: 0.25rem 0;
          animation: timer-pulse 2s infinite ease-in-out;
          transform-origin: center;
        }
      `}</style>
    </div>
  )
} 