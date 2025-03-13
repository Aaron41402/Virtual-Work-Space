'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RefreshCw, X, ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'

export default function CapybaraPomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work' or 'break'
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [capybaraState, setCapybaraState] = useState('sleep') // 'sleep', 'idle', 'walk-left', 'walk-right'
  const [capybaraPosition, setCapybaraPosition] = useState(0) // Position for horizontal movement
  const [walkingDirection, setWalkingDirection] = useState('right') // 'left' or 'right'
  const walkIntervalRef = useRef(null)
  const [showTooltip, setShowTooltip] = useState(false)

  // Timer logic
  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval)
            playAlarm()
            
            // Switch modes
            const nextMode = mode === 'work' ? 'break' : 'work'
            setMode(nextMode)
            setMinutes(nextMode === 'work' ? 25 : 5)
            setSeconds(0)
            setCapybaraState('idle')
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

  // Capybara walking animation
  useEffect(() => {
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current)
      walkIntervalRef.current = null
    }
    
    if (isActive && mode === 'work') {
      setCapybaraState(`walk-${walkingDirection}`)
      
      walkIntervalRef.current = setInterval(() => {
        setCapybaraPosition(prevPosition => {
          let newPosition = walkingDirection === 'right' 
            ? prevPosition + 5 
            : prevPosition - 5
          
          if (newPosition > 180) {
            setWalkingDirection('left')
            setCapybaraState('walk-left')
            return 180
          } else if (newPosition < -180) {
            setWalkingDirection('right')
            setCapybaraState('walk-right')
            return -180
          }
          
          return newPosition
        })
      }, 100)
    } else if (showPomodoro) {
      setCapybaraState('idle')
      setCapybaraPosition(0)
    } else {
      setCapybaraState('sleep')
      setCapybaraPosition(0)
    }
    
    return () => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current)
      }
    }
  }, [isActive, showPomodoro, mode, walkingDirection])

  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  // Reset timer
  const resetTimer = () => {
    setIsActive(false)
    setMode('work')
    setMinutes(25)
    setSeconds(0)
    setCapybaraState('idle')
    setCapybaraPosition(0)
  }
  
  // Play notification sound
  const playAlarm = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.7
      audio.play().catch(e => console.error("Audio play failed:", e))
    } catch (error) {
      console.error("Error playing notification:", error)
    }
  }

  // Toggle pomodoro visibility
  const togglePomodoro = () => {
    setShowPomodoro(!showPomodoro)
    if (!showPomodoro) {
      setCapybaraState('idle')
    } else {
      setIsActive(false)
      setCapybaraState('sleep')
      setCapybaraPosition(0)
    }
  }

  // Toggle expanded panel
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Switch between work and break modes
  const switchMode = (newMode) => {
    setMode(newMode)
    setMinutes(newMode === 'work' ? 25 : 5)
    setSeconds(0)
    setIsActive(false)
    setCapybaraState('idle')
  }

  // Get capybara animation
  const getCapybaraGif = () => {
    switch (capybaraState) {
      case 'sleep': return '/Capybara_sleep_left.gif'
      case 'idle': return '/Capybara_idle_relax.gif'
      case 'walk-left': return '/Capybara_walk_left.gif'
      case 'walk-right': return '/Capybara_walk_right.gif'
      default: return '/Capybara_sleep_left.gif'
    }
  }

  return (
    <div className="capybara-container">
      {/* Pomodoro Timer */}
      {showPomodoro && (
        <div className={`timer-container ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="timer-header">
            <div className="timer-title">
              <Image 
                src="/Capybara_static_left.png" 
                alt="Capybara" 
                width={20} 
                height={20} 
                className="mr-2"
              />
              <span>Capydoro</span>
            </div>
            <div className="header-controls">
              <button onClick={toggleExpanded} className="expand-btn">
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
              <button onClick={togglePomodoro} className="close-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="timer-content">
            {/* Main Timer */}
            <div className="timer-main">
              <div className="timer-display">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Expandable Panel */}
            {isExpanded && (
              <div className="timer-panel">
                <div className="panel-row">
                  <div className="panel-section">
                    <div className="panel-label">Mode</div>
                    <div className="mode-buttons">
                      <button 
                        onClick={() => switchMode('work')}
                        className={mode === 'work' ? 'active' : ''}
                      >
                        Work
                      </button>
                      <button 
                        onClick={() => switchMode('break')}
                        className={mode === 'break' ? 'active' : ''}
                      >
                        Break
                      </button>
                    </div>
                  </div>
                  
                  {/* Vertical separator */}
                  <div className="panel-separator"></div>
                  
                  <div className="panel-section">
                    <div className="panel-label">Controls</div>
                    <div className="timer-controls">
                      <button onClick={toggleTimer} className="control-btn">
                        {isActive ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button onClick={resetTimer} className="control-btn">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Capybara with Tooltip */}
      <div 
        className={`capybara ${capybaraState}`}
        onClick={togglePomodoro}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ transform: `translateX(${capybaraPosition}px)` }}
      >
        <Image 
          src={getCapybaraGif()} 
          alt="Capybara" 
          width={80} 
          height={80} 
        />
        {!showPomodoro && showTooltip && (
          <div className="capybara-tooltip">
            <div className="tooltip-content">
              <p className="tooltip-title">Meet Capydoro! 🌟</p>
              <p className="tooltip-text">Click me to start your productivity journey together!</p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .capybara-container {
          position: absolute;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
        }
        
        .timer-container {
          background-color: #2A2136;
          border: 2px solid #8BABBF;
          box-shadow: 4px 4px 0 #000;
          margin-bottom: 20px;
          z-index: 31;
          overflow: hidden;
          width: 220px;
          transition: width 0.3s ease;
        }
        
        .timer-container.expanded {
          width: 540px; /* Increased width to accommodate controls */
        }
        
        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: #4A3F6B;
          border-bottom: 2px solid #8BABBF;
        }
        
        .timer-title {
          display: flex;
          align-items: center;
          color: white;
          font-size: 14px;
          font-family: 'PixelFont', monospace;
        }
        
        .header-controls {
          display: flex;
          gap: 8px;
        }
        
        .close-btn, .expand-btn {
          color: #8BABBF;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .close-btn:hover, .expand-btn:hover {
          color: #E6C86E;
        }
        
        .timer-content {
          display: flex;
          height: 80px; /* Fixed height for the content area */
        }
        
        .timer-main {
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .timer-panel {
          width: 320px; /* Increased panel width */
          border-left: 2px solid #8BABBF;
          background-color: #3A2E56;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .panel-row {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
          padding: 0 15px;
        }
        
        .panel-separator {
          width: 1px;
          height: 50px;
          background-color: #8BABBF;
          margin: 0 15px;
        }
        
        .timer-display {
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          color: #E6C86E;
          font-family: 'PixelFont', monospace;
          text-shadow: 2px 2px 0 #000;
        }
        
        .panel-section {
          padding: 0 8px;
          width: 130px; /* Increased width for each section */
        }
        
        .panel-label {
          font-size: 12px;
          color: #8BABBF;
          margin-bottom: 6px;
          font-family: 'PixelFont', monospace;
          text-align: center;
        }
        
        .mode-buttons {
          display: flex;
          gap: 8px; /* Increased gap between buttons */
        }
        
        .mode-buttons button {
          flex: 1;
          padding: 6px 10px; /* Added horizontal padding */
          background-color: #2A2136;
          border: 1px solid #8BABBF;
          color: #8BABBF;
          font-size: 10px; /* Reduced font size */
          cursor: pointer;
          font-family: 'PixelFont', monospace;
          white-space: nowrap;
          min-width: 56px; /* Ensure minimum width */
          height: 28px; /* Fixed height for buttons */
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        
        .mode-buttons button.active {
          background-color: #4A3F6B;
          color: #E6C86E;
          border-color: #E6C86E;
        }
        
        .timer-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        
        .control-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #2A2136;
          border: 1px solid #8BABBF;
          color: white;
          cursor: pointer;
        }
        
        .control-btn:hover {
          border-color: #E6C86E;
          background-color: #4A3F6B;
        }
        
        .capybara {
          transition: transform 0.1s linear;
          filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.7));
          image-rendering: pixelated;
          position: relative;
          z-index: 32;
          cursor: pointer;
          margin-top: -45px;
        }
        
        /* Position adjustment for sleeping capybara */
        .capybara.sleep {
          margin-top: 100px;
        }
        
        /* Tooltip Styles */
        .capybara-tooltip {
          position: absolute;
          bottom: 70%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #2A2136;
          border: 2px solid #E6C86E;
          padding: 12px;
          border-radius: 4px;
          width: max-content;
          max-width: 200px;
          margin-bottom: 8px;
          box-shadow: 4px 4px 0 #000;
          z-index: 40;
          pointer-events: none;
          animation: tooltipFadeIn 0.3s ease;
        }

        .capybara-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px;
          border-style: solid;
          border-color: #E6C86E transparent transparent transparent;
        }

        .tooltip-content {
          text-align: center;
        }

        .tooltip-title {
          color: #E6C86E;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 4px;
          font-family: 'PixelFont', monospace;
        }

        .tooltip-text {
          color: #8BABBF;
          font-size: 12px;
          line-height: 1.4;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* Adjust sleeping capybara position for tooltip visibility */
        .capybara.sleep {
          margin-top: 100px;
        }
      `}</style>
    </div>
  )
} 