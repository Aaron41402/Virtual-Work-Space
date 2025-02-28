'use client'

import React from 'react'

export default function VideoBackground() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="fixed top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover opacity-75"
      onError={(e) => console.error('Video error:', e)}
      onLoadedData={() => console.log('Video loaded successfully')}
    >
      <source src="/lofi.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
} 