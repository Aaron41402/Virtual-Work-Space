import React from 'react'

function TodaySchedule() {
  return (
    <div className="flex-1 p-8 relative z-10">
      {/* Main Content */}
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
  )
}

export default TodaySchedule