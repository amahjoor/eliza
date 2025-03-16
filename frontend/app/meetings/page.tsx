'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'

// Mock data for meetings
const mockMeetings = [
  {
    id: 1,
    name: 'Weekly Team Sync',
    startTime: '2025-03-10T10:00:00Z',
    endTime: '2025-03-10T11:00:00Z',
    duration: 3600,
    recordingType: 'zoom',
    status: 'completed',
    attendees: [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' }
    ],
    project: { id: 1, name: 'Product Launch' }
  },
  {
    id: 2,
    name: 'Product Planning',
    startTime: '2025-03-12T14:00:00Z',
    endTime: '2025-03-12T15:30:00Z',
    duration: 5400,
    recordingType: 'teams',
    status: 'completed',
    attendees: [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 3, firstName: 'Mike', lastName: 'Johnson' }
    ],
    project: { id: 1, name: 'Product Launch' }
  },
  {
    id: 3,
    name: 'Client Presentation',
    startTime: '2025-03-15T09:00:00Z',
    endTime: '2025-03-15T10:00:00Z',
    duration: 3600,
    recordingType: 'physical',
    status: 'completed',
    attendees: [
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
      { id: 4, firstName: 'Sarah', lastName: 'Williams' }
    ],
    project: { id: 2, name: 'Client Onboarding' }
  }
]

export default function MeetingsPage() {
  const { user, loading } = useAuth()
  const [meetings, setMeetings] = useState(mockMeetings)
  
  // If loading, show loading indicator
  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }
  
  // If not authenticated, this will be handled by AuthProvider redirect
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'project' | 'people'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Get unique projects
  const projects = Array.from(new Set(meetings.map(m => m.project?.name))).filter(Boolean) as string[]
  
  // Get unique people
  const people = Array.from(
    new Set(
      meetings.flatMap(m => m.attendees.map(a => `${a.firstName} ${a.lastName}`))
    )
  )
  
  // Filter meetings based on search query and filters
  const filteredMeetings = meetings.filter(meeting => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      meeting.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    let matchesCategory = true
    if (categoryFilter === 'project' && selectedCategory) {
      matchesCategory = meeting.project?.name === selectedCategory
    } else if (categoryFilter === 'people' && selectedCategory) {
      matchesCategory = meeting.attendees.some(
        a => `${a.firstName} ${a.lastName}` === selectedCategory
      )
    }
    
    return matchesSearch && matchesCategory
  })
  
  // Group meetings by category
  const groupedMeetings: Record<string, typeof meetings> = {}
  
  if (categoryFilter === 'project') {
    projects.forEach(project => {
      groupedMeetings[project] = filteredMeetings.filter(m => m.project?.name === project)
    })
  } else if (categoryFilter === 'people') {
    people.forEach(person => {
      groupedMeetings[person] = filteredMeetings.filter(m => 
        m.attendees.some(a => `${a.firstName} ${a.lastName}` === person)
      )
    })
  } else {
    // Group by month
    filteredMeetings.forEach(meeting => {
      const month = new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!groupedMeetings[month]) {
        groupedMeetings[month] = []
      }
      groupedMeetings[month].push(meeting)
    })
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meetings</h1>
        
        <div className="flex gap-4">
          <Link
            href="/record"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all"
          >
            🎤 Record Meeting
          </Link>
          <button
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg flex items-center transition-all"
          >
            📤 Upload Recording
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search meetings..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as any)
              setSelectedCategory(null)
            }}
          >
            <option value="all">All Meetings</option>
            <option value="project">By Project</option>
            <option value="people">By People</option>
          </select>
        </div>
        
        {categoryFilter !== 'all' && (
          <div className="flex gap-2 flex-wrap">
            {categoryFilter === 'project' ? (
              projects.map(project => (
                <button
                  key={project}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === project
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  onClick={() => setSelectedCategory(project)}
                >
                  {project}
                </button>
              ))
            ) : (
              people.map(person => (
                <button
                  key={person}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === person
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  onClick={() => setSelectedCategory(person)}
                >
                  {person}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Meeting List */}
      <div>
        {Object.keys(groupedMeetings).length > 0 ? (
          Object.entries(groupedMeetings).map(([category, meetings]) => (
            meetings.length > 0 && (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-neutral-800 pb-2">{category}</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {meetings.map(meeting => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="glass-panel p-4 hover:bg-neutral-800/50 transition-all meeting-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{meeting.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300">
                          {meeting.recordingType}
                        </span>
                      </div>
                      
                      <div className="text-sm text-neutral-400 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span>📅</span>
                          <span>{formatDate(meeting.startTime)}</span>
                          <span>•</span>
                          <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                          <span>•</span>
                          <span>{formatDuration(meeting.duration)}</span>
                        </div>
                        
                        {meeting.project && (
                          <div className="flex items-center gap-2 mb-1">
                            <span>📂</span>
                            <span>{meeting.project.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 3).map((attendee, index) => (
                            <div
                              key={attendee.id}
                              className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs border-2 border-neutral-900"
                              title={`${attendee.firstName} ${attendee.lastName}`}
                            >
                              {attendee.firstName[0]}{attendee.lastName[0]}
                            </div>
                          ))}
                          
                          {meeting.attendees.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs border-2 border-neutral-900">
                              +{meeting.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No meetings found</h3>
            <p className="text-neutral-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
