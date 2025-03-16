'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    name: 'Product Launch',
    description: 'Planning and execution of the new product launch in Q2',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    status: 'active',
    meetingCount: 12,
    memberCount: 5,
    progress: 65,
    recentMeetings: [
      { id: 1, name: 'Weekly Team Sync', date: '2025-03-10' },
      { id: 2, name: 'Product Planning', date: '2025-03-12' }
    ]
  },
  {
    id: 2,
    name: 'Client Onboarding',
    description: 'Streamlining the client onboarding process for enterprise customers',
    startDate: '2025-02-01',
    endDate: '2025-04-15',
    status: 'active',
    meetingCount: 8,
    memberCount: 4,
    progress: 40,
    recentMeetings: [
      { id: 3, name: 'Client Presentation', date: '2025-03-15' }
    ]
  },
  {
    id: 3,
    name: 'Website Redesign',
    description: 'Redesigning the company website with improved UX and modern design',
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    status: 'planning',
    meetingCount: 3,
    memberCount: 6,
    progress: 15,
    recentMeetings: []
  },
  {
    id: 4,
    name: 'Q1 Marketing Campaign',
    description: 'Planning and execution of Q1 marketing initiatives',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'completed',
    meetingCount: 10,
    memberCount: 3,
    progress: 100,
    recentMeetings: []
  }
]

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState(mockProjects)
  
  // If loading, show loading indicator
  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }
  
  // If not authenticated, this will be handled by AuthProvider redirect
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  
  // Filter projects based on search query and filters
  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = !statusFilter || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        
        <button
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all"
        >
          📂 New Project
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="glass-panel p-5 hover:bg-neutral-800/50 transition-all meeting-card"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'active' ? 'bg-green-900/50 text-green-400' :
                  project.status === 'planning' ? 'bg-blue-900/50 text-blue-400' :
                  project.status === 'completed' ? 'bg-neutral-700 text-neutral-300' :
                  'bg-amber-900/50 text-amber-400'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              
              <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      project.progress < 30 ? 'bg-blue-500' :
                      project.progress < 70 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-neutral-400">Timeline</div>
                  <div>{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                </div>
                <div>
                  <div className="text-neutral-400">Team</div>
                  <div>{project.memberCount} members</div>
                </div>
                <div>
                  <div className="text-neutral-400">Meetings</div>
                  <div>{project.meetingCount} total</div>
                </div>
              </div>
              
              {project.recentMeetings.length > 0 && (
                <div>
                  <div className="text-sm text-neutral-400 mb-2">Recent Meetings</div>
                  <div className="space-y-2">
                    {project.recentMeetings.map(meeting => (
                      <div key={meeting.id} className="flex justify-between text-sm">
                        <span>{meeting.name}</span>
                        <span className="text-neutral-500">{formatDate(meeting.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No projects found</h3>
            <p className="text-neutral-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
