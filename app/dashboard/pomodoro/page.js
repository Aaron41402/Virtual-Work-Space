'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import VideoBackground from '@/components/VideoBackground'

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work' or 'break'

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval)
            const nextMode = mode === 'work' ? 'break' : 'work'
            setMode(nextMode)
            setMinutes(nextMode === 'work' ? 25 : 5)
            setSeconds(0)
            playAlarm()
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
  const playAlarm = () => {
    const audio = new Audio('/notification.mp3')
    audio.play()
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <VideoBackground />
      
      {/* Back to Dashboard Button */}
      <Link 
        href="/dashboard" 
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-lg font-semibold text-gray-700 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            {mode === 'work' ? 'Work Time' : 'Break Time'}
          </h1>
          
          <div className="text-6xl font-bold text-center mb-8">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={toggleTimer}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
            >
              Reset
            </button>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setMode('work')
                setMinutes(25)
                setSeconds(0)
                setIsActive(false)
              }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                mode === 'work'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
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
              className={`px-4 py-2 rounded-lg font-semibold ${
                mode === 'break'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Break (5m)
            </button>
            
          </div>
          {/*update here*/}
          <div className="flex justify-center space-x-4 pt-4">
              <details className="dropdown">
                <summary className="btn m-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                  <li><a>🔥 Fire</a></li>
                  <li><a>🌊 Wave</a></li>
                  <li><a>☔ Rain</a></li>
                  <li><a>☕ Coffee Shop</a></li>
                </ul>
              </details>
            </div>
        </div>
      </div>
      
    </div>
  )
} 