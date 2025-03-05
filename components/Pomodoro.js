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
    <div className="mt-4 bg-gray-700 rounded-lg overflow-hidden">
      {/* Header with title */}
      <div 
        className="p-3 flex justify-between items-center cursor-pointer bg-gray-600"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <span className="text-red-400 mr-2">🍅</span>
          <span className="font-medium">Pomodoro</span>
        </div>
        <button className="text-gray-300 hover:text-white">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Timer display (always visible and bigger) */}
      <div className="py-4 px-3 flex justify-center">
        <div className="text-5xl font-bold tracking-wider">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-gray-600">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-300">
              {mode === 'work' ? 'Work Time' : 'Break Time'}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={toggleTimer}
                className="p-1 rounded hover:bg-gray-600"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-1 rounded hover:bg-gray-600"
              >
                <RefreshCw size={16} />
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
              className={`px-2 py-1 text-xs rounded ${
                mode === 'work'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              Work (25m)
            </button>
            <button
              onClick={() => {
                setMode('break')
                setMinutes(1)
                setSeconds(0)
                setIsActive(false)
              }}
              className={`px-2 py-1 text-xs rounded ${
                mode === 'break'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              Break (5m)
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 