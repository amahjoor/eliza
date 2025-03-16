'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Mock data for a meeting
const mockMeeting = {
  id: 1,
  name: 'Weekly Team Sync',
  startTime: '2025-03-10T10:00:00Z',
  endTime: '2025-03-10T11:00:00Z',
  duration: 3600,
  recordingType: 'zoom',
  status: 'completed',
  attendees: [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson' }
  ],
  project: { id: 1, name: 'Product Launch' }
}

// Mock data for transcript
const mockTranscript = [
  {
    speakerId: 'speaker1',
    speakerName: 'John Doe',
    startTime: 0,
    endTime: 15,
    text: 'Good morning everyone. Today we\'ll be discussing the product launch timeline and key deliverables.'
  },
  {
    speakerId: 'speaker2',
    speakerName: 'Jane Smith',
    startTime: 16,
    endTime: 30,
    text: 'I\'ve prepared a presentation on the marketing strategy. We should focus on social media campaigns starting next week.'
  },
  {
    speakerId: 'speaker3',
    speakerName: 'Mike Johnson',
    startTime: 31,
    endTime: 45,
    text: 'I agree with Jane. We should also consider partnering with influencers to increase our reach.'
  },
  {
    speakerId: 'speaker1',
    speakerName: 'John Doe',
    startTime: 46,
    endTime: 60,
    text: 'Great points. Let\'s allocate budget for both approaches. Mike, can you prepare a proposal for the influencer partnerships?'
  },
  {
    speakerId: 'speaker3',
    speakerName: 'Mike Johnson',
    startTime: 61,
    endTime: 75,
    text: 'Yes, I\'ll have that ready by Friday. I\'ll also include some metrics from our previous campaigns for comparison.'
  }
]

// Mock data for meeting notes
const mockMeetingNotes = {
  summary: 'The team discussed the product launch timeline, marketing strategy, and influencer partnerships. Key decisions were made regarding budget allocation and next steps.',
  outline: [
    {
      id: '1',
      title: 'Introduction',
      content: 'John introduced the meeting agenda focusing on product launch timeline and deliverables.'
    },
    {
      id: '2',
      title: 'Marketing Strategy',
      content: 'Jane presented the marketing strategy with emphasis on social media campaigns starting next week.'
    },
    {
      id: '3',
      title: 'Influencer Partnerships',
      content: 'Mike suggested partnering with influencers to increase reach. The team agreed to allocate budget for this approach.'
    },
    {
      id: '4',
      title: 'Next Steps',
      content: 'Mike will prepare a proposal for influencer partnerships by Friday, including metrics from previous campaigns.'
    }
  ],
  actionItems: [
    {
      id: '1',
      task: 'Prepare influencer partnership proposal',
      assignee: 'Mike Johnson',
      dueDate: '2025-03-20',
      status: 'todo',
      priority: 'high'
    },
    {
      id: '2',
      task: 'Finalize social media campaign calendar',
      assignee: 'Jane Smith',
      dueDate: '2025-03-18',
      status: 'todo',
      priority: 'medium'
    },
    {
      id: '3',
      task: 'Allocate marketing budget',
      assignee: 'John Doe',
      dueDate: '2025-03-15',
      status: 'todo',
      priority: 'high'
    }
  ],
  content: `# Meeting Summary

The team discussed the product launch timeline, marketing strategy, and influencer partnerships. Key decisions were made regarding budget allocation and next steps.

## Outline

### Introduction
John introduced the meeting agenda focusing on product launch timeline and deliverables.

### Marketing Strategy
Jane presented the marketing strategy with emphasis on social media campaigns starting next week.

### Influencer Partnerships
Mike suggested partnering with influencers to increase reach. The team agreed to allocate budget for this approach.

### Next Steps
Mike will prepare a proposal for influencer partnerships by Friday, including metrics from previous campaigns.

## Action Items

- [ ] **Prepare influencer partnership proposal** (Assigned to: Mike Johnson, Due: 2025-03-20, Priority: high)
- [ ] **Finalize social media campaign calendar** (Assigned to: Jane Smith, Due: 2025-03-18, Priority: medium)
- [ ] **Allocate marketing budget** (Assigned to: John Doe, Due: 2025-03-15, Priority: high)
`
}

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id
  
  const [meeting, setMeeting] = useState(mockMeeting)
  const [transcript, setTranscript] = useState(mockTranscript)
  const [meetingNotes, setMeetingNotes] = useState(mockMeetingNotes)
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes'>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
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
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  
  // Format timestamp
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Filter transcript based on search query
  const filteredTranscript = transcript.filter(item => 
    searchQuery === '' || 
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.speakerName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/meetings"
          className="text-neutral-400 hover:text-white flex items-center gap-1"
        >
          ← Back to Meetings
        </Link>
      </div>
      
      {/* Meeting header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{meeting.name}</h1>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-neutral-400 mb-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatDate(meeting.startTime)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>⌛</span>
            <span>{formatDuration(meeting.duration)}</span>
          </div>
          
          {meeting.project && (
            <div className="flex items-center gap-2">
              <span>📂</span>
              <Link href={`/projects/${meeting.project.id}`} className="text-primary-400 hover:text-primary-300">
                {meeting.project.name}
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {meeting.attendees.map(attendee => (
            <Link
              key={attendee.id}
              href={`/people/${attendee.id}`}
              className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full text-sm hover:bg-neutral-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
                {attendee.firstName[0]}{attendee.lastName[0]}
              </div>
              <span>{attendee.firstName} {attendee.lastName}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-6">
        <div className="flex bg-neutral-800 rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'notes'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Meeting Notes
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'transcript'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="glass-panel p-6">
        {activeTab === 'transcript' ? (
          <div>
            {/* Search bar for transcript */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search transcript..."
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Transcript content */}
            <div className="space-y-4">
              {filteredTranscript.map((item, index) => (
                <div key={index} className="transcript-line">
                  <div className="flex items-start gap-2">
                    <div className="text-neutral-500 font-mono w-10 pt-1">
                      {formatTimestamp(item.startTime)}
                    </div>
                    <div className="flex-1">
                      <div className="transcript-speaker mb-1">{item.speakerName}</div>
                      <div>{item.text}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTranscript.length === 0 && (
                <div className="text-center py-8 text-neutral-400">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Meeting notes content */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              <p className="text-neutral-300">{meetingNotes.summary}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Outline</h2>
              <div className="space-y-4">
                {meetingNotes.outline.map(section => (
                  <div key={section.id} className="ai-generated">
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    <p className="text-neutral-300">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Action Items</h2>
              <div className="space-y-3">
                {meetingNotes.actionItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={item.status === 'completed'}
                        onChange={() => {
                          // In a real implementation, this would update the action item status
                        }}
                        className="w-5 h-5 rounded border-neutral-600"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{item.task}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{item.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🚩</span>
                          <span className={`
                            ${item.priority === 'high' ? 'text-red-400' : ''}
                            ${item.priority === 'medium' ? 'text-yellow-400' : ''}
                            ${item.priority === 'low' ? 'text-green-400' : ''}
                          `}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
