'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Mock data for a person
const mockPerson = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  organization: 'Acme Inc.',
  role: 'Product Manager',
  meetingCount: 15,
  networkConnectivity: 'high',
  aiSummary: 'John frequently leads discussions on product strategy and roadmap planning. He asks insightful questions and helps the team stay focused on key objectives. His contributions are particularly valuable in strategic planning sessions and feature prioritization meetings.',
  meetings: [
    {
      id: 1,
      name: 'Weekly Team Sync',
      date: '2025-03-10',
      speakingTime: 720, // seconds
      topics: ['Product roadmap', 'Sprint planning', 'Feature prioritization']
    },
    {
      id: 2,
      name: 'Product Planning',
      date: '2025-03-12',
      speakingTime: 840, // seconds
      topics: ['Market analysis', 'Competitor review', 'Q2 goals']
    },
    {
      id: 3,
      name: 'Stakeholder Update',
      date: '2025-03-05',
      speakingTime: 600, // seconds
      topics: ['Project status', 'Timeline review', 'Resource allocation']
    }
  ],
  contributions: [
    {
      meetingId: 1,
      meetingName: 'Weekly Team Sync',
      date: '2025-03-10',
      insights: [
        'Suggested focusing on core features for the initial release',
        'Identified potential bottlenecks in the development timeline'
      ],
      decisions: [
        'Approved the revised sprint schedule',
        'Allocated additional resources to the frontend team'
      ]
    },
    {
      meetingId: 2,
      meetingName: 'Product Planning',
      date: '2025-03-12',
      insights: [
        'Presented competitive analysis showing key market opportunities',
        'Proposed new pricing strategy based on customer feedback'
      ],
      decisions: [
        'Selected target market segments for Q2 campaign',
        'Approved budget reallocation for marketing initiatives'
      ]
    }
  ],
  projects: [
    { id: 1, name: 'Product Launch', role: 'Project Lead' },
    { id: 3, name: 'Website Redesign', role: 'Stakeholder' }
  ]
}

export default function PersonDetailPage() {
  const params = useParams()
  const personId = params.id
  
  const [person, setPerson] = useState(mockPerson)
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'contributions'>('overview')
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  // Format speaking time
  const formatSpeakingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/people"
          className="text-neutral-400 hover:text-white flex items-center gap-1"
        >
          ← Back to People
        </Link>
      </div>
      
      {/* Person header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center text-3xl">
          {person.firstName[0]}{person.lastName[0]}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{person.firstName} {person.lastName}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-neutral-400 mb-4">
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>{person.role}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span>{person.organization}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>📧</span>
              <a href={`mailto:${person.email}`} className="text-primary-400 hover:text-primary-300">
                {person.email}
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <span className="text-primary-400">📊</span>
              <span>{person.meetingCount} meetings attended</span>
            </div>
            
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <span className={`
                ${person.networkConnectivity === 'high' ? 'text-green-400' : ''}
                ${person.networkConnectivity === 'medium' ? 'text-yellow-400' : ''}
                ${person.networkConnectivity === 'low' ? 'text-red-400' : ''}
              `}>🔗</span>
              <span>{person.networkConnectivity} network connectivity</span>
            </div>
            
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <span className="text-secondary-400">📂</span>
              <span>{person.projects.length} projects</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-6">
        <div className="flex bg-neutral-800 rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'overview'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'meetings'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('meetings')}
          >
            Meetings
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'contributions'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('contributions')}
          >
            Contributions
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="glass-panel p-6">
        {activeTab === 'overview' && (
          <div>
            {/* AI Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">AI Summary</h2>
              <div className="ai-generated p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-neutral-300">{person.aiSummary}</p>
              </div>
            </div>
            
            {/* Projects */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Projects</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {person.projects.map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="glass-panel p-4 hover:bg-neutral-800/50 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{project.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300">
                        {project.role}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Recent Meetings */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Recent Meetings</h2>
                <button
                  className="text-primary-400 hover:text-primary-300 text-sm"
                  onClick={() => setActiveTab('meetings')}
                >
                  View all →
                </button>
              </div>
              
              <div className="space-y-4">
                {person.meetings.slice(0, 3).map(meeting => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-all"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{meeting.name}</h3>
                      <span className="text-neutral-500">{formatDate(meeting.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                      <span>⏱️</span>
                      <span>Speaking time: {formatSpeakingTime(meeting.speakingTime)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {meeting.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'meetings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Meeting History</h2>
            
            <div className="space-y-4">
              {person.meetings.map(meeting => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="block p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-all"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{meeting.name}</h3>
                    <span className="text-neutral-500">{formatDate(meeting.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                    <span>⏱️</span>
                    <span>Speaking time: {formatSpeakingTime(meeting.speakingTime)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {meeting.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'contributions' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Key Contributions</h2>
            
            <div className="space-y-8">
              {person.contributions.map(contribution => (
                <div key={contribution.meetingId} className="border-b border-neutral-800 pb-6 last:border-0">
                  <div className="flex justify-between mb-4">
                    <Link
                      href={`/meetings/${contribution.meetingId}`}
                      className="text-xl font-medium text-primary-400 hover:text-primary-300"
                    >
                      {contribution.meetingName}
                    </Link>
                    <span className="text-neutral-500">{formatDate(contribution.date)}</span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Insights</h3>
                    <ul className="list-disc list-inside space-y-1 text-neutral-300">
                      {contribution.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Decisions</h3>
                    <ul className="list-disc list-inside space-y-1 text-neutral-300">
                      {contribution.decisions.map((decision, index) => (
                        <li key={index}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
