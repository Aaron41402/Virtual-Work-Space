import ButtonLogout from '@/components/ButtonLogout'
import VideoBackground from '@/components/VideoBackground'
import Link from 'next/link'
import React from 'react'

export default function Dashboard() {
  return (
    <main className="flex min-h-screen relative overflow-hidden">
      <VideoBackground />

      {/* Sidebar */}
      <div className="w-64 bg-gray-800/90 text-white p-6 flex flex-col justify-between relative z-10">
        <div>
          <h2 className="text-xl font-bold mb-6">Dashboard</h2>
          <nav className="space-y-4">
            <Link href="/dashboard/analysis" className="block hover:bg-gray-700 p-2 rounded">
            📈 Analysis
            </Link>
            <Link href="/dashboard/todo" className="block hover:bg-gray-700 p-2 rounded">
            📝 To Do
            </Link>
            <Link href="/dashboard/pomodoro" className="block hover:bg-gray-700 p-2 rounded">
            🍅 Pomodoro
            </Link>
          </nav>
        </div>
        <div className="mt-auto">
          <ButtonLogout />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm w-3/4 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-24 text-gray-600">9:00 AM</div>
              <div className="flex-1 bg-blue-50/90 p-3 rounded">
                Morning standup meeting
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 text-gray-600">11:00 AM</div>
              <div className="flex-1 bg-green-50/90 p-3 rounded">
                Project planning
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 text-gray-600">2:00 PM</div>
              <div className="flex-1 bg-purple-50/90 p-3 rounded">
                Team collaboration
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 text-gray-600">4:00 PM</div>
              <div className="flex-1 bg-yellow-50/90 p-3 rounded">
                Daily review
              </div>
            </div>
          </div>
        </div>
      </div>
      
    <script src="https://cdn.botpress.cloud/webchat/v2.2/inject.js"></script>
    <script src="https://files.bpcontent.cloud/2025/02/28/19/20250228192050-G6ZM6L05.js"></script>
    
    </main>
  )
}

