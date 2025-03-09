'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Play, Pause, RefreshCw } from 'lucide-react'

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work' or 'break'
  const [isExpanded, setIsExpanded] = useState(false)

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

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setMode('work')
    setMinutes(25)
    setSeconds(0)
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

  return (
    <div className="mt-2 overflow-hidden">
      {/* Header with title */}
      <div 
        className="p-2 flex justify-between items-center cursor-pointer bg-[#4A3F6B] border-b-2 border-[#8BABBF]"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <span className="mr-2">🍅</span>
          <span className="font-medium text-[#E6C86E] text-sm">Pomodoro</span>
        </div>
        <button className="text-[#8BABBF] hover:text-[#E6C86E]">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Timer display (always visible and bigger) */}
      <div className="py-2 px-2 flex justify-center bg-[#3A2E56]">
        <div className="text-3xl font-bold tracking-wider text-[#FF6B97] pixel-shadow">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="p-2 border-t-2 border-[#8BABBF] bg-[#3A2E56]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-center text-[#8BABBF]">
              {mode === 'work' ? 'Work Time' : 'Break Time'}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={toggleTimer}
                className="p-1 border border-[#8BABBF] hover:bg-[#4A3F6B] hover:border-[#E6C86E] pixel-button-sm"
              >
                {isActive ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-1 border border-[#8BABBF] hover:bg-[#4A3F6B] hover:border-[#E6C86E] pixel-button-sm"
              >
                <RefreshCw size={14} />
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
              }}
              className={`px-2 py-1 text-xs border-2 ${
                mode === 'work'
                  ? 'bg-[#4A3F6B] border-[#FF6B97] text-[#FF6B97]'
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
              }}
              className={`px-2 py-1 text-xs border-2 ${
                mode === 'break'
                  ? 'bg-[#4A3F6B] border-[#FF6B97] text-[#FF6B97]'
                  : 'bg-[#2A2136] border-[#8BABBF] text-[#8BABBF] hover:border-[#E6C86E] hover:text-[#E6C86E]'
              } pixel-button-sm`}
            >
              Break (5m)
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .pixel-button-sm {
          image-rendering: pixelated;
          transition: all 0.1s ease;
          box-shadow: 2px 2px 0 #000;
          position: relative;
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
          text-shadow: 2px 2px 0 #000;
        }
      `}</style>
    </div>
  )
} 