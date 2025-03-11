'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SpotifyIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [spotifyToken, setSpotifyToken] = useState(null)
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTrack: null,
    deviceId: null
  })

  // Spotify API credentials - store these in environment variables in production
  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : ''
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPES = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
    "user-read-email",
    "user-read-private"
  ]

  // Check for token on component mount
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("spotify_token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("spotify_token", token)
    }

    setSpotifyToken(token)
    setIsConnected(!!token)
  }, [])

  // Logout function
  const logout = () => {
    setSpotifyToken(null)
    setIsConnected(false)
    window.localStorage.removeItem("spotify_token")
  }

  // Connect to Spotify
  const connectSpotify = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`
  }

  // Get current playback state
  useEffect(() => {
    if (!spotifyToken) return

    const getCurrentTrack = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        })
        
        if (response.status === 204) {
          // No track playing
          return
        }
        
        const data = await response.json()
        setPlayerState(prev => ({
          ...prev,
          isPlaying: data.is_playing,
          currentTrack: data.item
        }))
      } catch (error) {
        console.error("Error fetching current track:", error)
        // If we get a 401, token is expired
        if (error.message.includes('401')) {
          logout()
        }
      }
    }

    getCurrentTrack()
    // Poll for updates every 5 seconds
    const interval = setInterval(getCurrentTrack, 5000)
    
    return () => clearInterval(interval)
  }, [spotifyToken])

  // Play/Pause functionality
  const togglePlayback = async () => {
    if (!spotifyToken) return
    
    try {
      const method = playerState.isPlaying ? 'PUT' : 'PUT'
      const endpoint = playerState.isPlaying ? 
        'https://api.spotify.com/v1/me/player/pause' : 
        'https://api.spotify.com/v1/me/player/play'
      
      await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      })
      
      // Update local state
      setPlayerState(prev => ({
        ...prev,
        isPlaying: !prev.isPlaying
      }))
    } catch (error) {
      console.error("Error toggling playback:", error)
    }
  }
  
  // Skip to next track
  const nextTrack = async () => {
    if (!spotifyToken) return
    
    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      })
      
      // Wait a moment for Spotify to update, then get the new track
      setTimeout(async () => {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        })
        
        if (response.status === 204) return
        
        const data = await response.json()
        setPlayerState(prev => ({
          ...prev,
          isPlaying: data.is_playing,
          currentTrack: data.item
        }))
      }, 500)
    } catch (error) {
      console.error("Error skipping to next track:", error)
    }
  }
  
  // Skip to previous track
  const previousTrack = async () => {
    if (!spotifyToken) return
    
    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      })
      
      // Wait a moment for Spotify to update, then get the new track
      setTimeout(async () => {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        })
        
        if (response.status === 204) return
        
        const data = await response.json()
        setPlayerState(prev => ({
          ...prev,
          isPlaying: data.is_playing,
          currentTrack: data.item
        }))
      }, 500)
    } catch (error) {
      console.error("Error skipping to previous track:", error)
    }
  }

  return (
    <div className="mt-4 w-full">
      {!isConnected ? (
        <button 
          onClick={connectSpotify}
          className="w-full flex items-center justify-center bg-[#1DB954] text-white border-2 border-[#E6C86E] rounded-md p-2 shadow-lg hover:bg-[#1ed760] transition-all duration-200 font-pixel"
        >
          <Image 
            src="/spotify-logo.png" 
            alt="Spotify" 
            width={24} 
            height={24} 
            className="mr-2"
          />
          <span>Connect Spotify</span>
        </button>
      ) : (
        <div className="bg-[#3A2E56] p-2 border-2 border-[#E6C86E] rounded-md shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Image 
                src="/spotify-logo.png" 
                alt="Spotify" 
                width={24} 
                height={24} 
                className="mr-1"
              />
              <span className="text-[#E6C86E] text-base">Spotify</span>
            </div>
            <button 
              onClick={logout}
              className="text-xs text-[#FF6B97] hover:underline"
              aria-label="Disconnect Spotify"
            >
              ×
            </button>
          </div>
          
          {playerState.currentTrack ? (
            <>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-1 flex-shrink-0">
                  <img 
                    src={playerState.currentTrack.album.images[0].url} 
                    alt={playerState.currentTrack.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0 mx-1">
                  <div className="text-white text-xs font-semibold truncate">
                    {playerState.currentTrack.name}
                  </div>
                  <div className="text-[#8BABBF] text-xs truncate">
                    {playerState.currentTrack.artists.map(a => a.name).join(", ")}
                  </div>
                </div>
              </div>
              
              {/* Playback controls - fixed alignment */}
              <div className="flex justify-between items-center">
                <div className="flex-1 flex justify-center">
                  <button 
                    onClick={previousTrack}
                    className="w-8 h-8 flex items-center justify-center text-xl bg-[#3A2E56] text-[#8BABBF] hover:text-white"
                    aria-label="Previous track"
                  >
                    ⏮
                  </button>
                </div>
                <div className="flex-1 flex justify-center">
                  <button 
                    onClick={togglePlayback}
                    className="w-8 h-8 flex items-center justify-center bg-[#1DB954] text-white rounded-full"
                    aria-label={playerState.isPlaying ? "Pause" : "Play"}
                  >
                    {playerState.isPlaying ? "⏸" : "▶"}
                  </button>
                </div>
                <div className="flex-1 flex justify-center">
                  <button 
                    onClick={nextTrack}
                    className="w-8 h-8 flex items-center justify-center text-xl bg-[#3A2E56] text-[#8BABBF] hover:text-white"
                    aria-label="Next track"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-[#8BABBF] text-xs text-center py-1">
              No track playing
            </div>
          )}
        </div>
      )}
    </div>
  )
} 