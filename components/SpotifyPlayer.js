'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function SpotifyPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 z-30">
      {/* Spotify Embed Container */}
      <div 
        className={`transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-100 translate-x-64' : 'opacity-0 translate-x-0 pointer-events-none'}`}
        style={{ 
          width: '500px',
          height: '220px',
        }}
      >
        <div className="h-full w-full pb-4 pl-2 pr-2">
          <iframe 
            style={{ borderRadius: '12px' }} 
            src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          ></iframe>
        </div>
      </div>
      
      {/* Toggle Button - Positioned outside the sidebar with pixel_headphone.png */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-4 left-72 z-40 w-12 h-12 flex items-center justify-center bg-[#2A2136] text-[#E6C86E] border-2 border-[#E6C86E] rounded-full shadow-lg hover:bg-[#3A2E56] transition-all duration-200 font-pixel"
      >
        {isExpanded ? (
          '✕'
        ) : (
          <Image 
            src="/pixel_headphone.png" 
            alt="Music" 
            width={24} 
            height={24} 
          />
        )}
      </button>
      
      <style jsx>{`
        button {
          box-shadow: 3px 3px 0 #000;
          transition: all 0.2s ease;
        }
        
        button:hover {
          transform: translateY(-4px);
          box-shadow: 4px 4px 0 #000;
        }
        
        button:active {
          transform: translateY(0);
          box-shadow: 1px 1px 0 #000;
        }
      `}</style>
    </div>
  );
} 