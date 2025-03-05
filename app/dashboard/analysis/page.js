import React from 'react'
import VideoBackground from '@/components/VideoBackground'
import Link from 'next/link'
// import UserAnalysis from '@/components/UserAnalysis'

export default function Analysis() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <VideoBackground />
      {/* Back to Dashboard Button */}
      <Link href="/dashboard">
        <button className="absolute top-4 left-4 z-10 px-4 py-2 btn btn-soft btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </Link>
      {/* <UserAnalysis /> */}
    </div>
  )
} 