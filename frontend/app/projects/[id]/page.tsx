'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Mock data for a project
const mockProject = {
  id: 1,
  name: 'Product Launch',
  description: 'Planning and execution of the new product launch in Q2',
  startDate: '2025-01-15',
  endDate: '2025-06-30',
  status: 'active',
  progress: 65,
  members: [
    { id: 1, firstName: 'John', lastName: 'Doe', role: 'Project Lead' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'Marketing Lead' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', role: 'Developer' },
    { id: 4, firstName: 'Sarah', lastName: 'Williams', role: 'Designer' },
    { id: 5, firstName: 'Alex', lastName: 'Brown', role: 'QA Engineer' }
  ],
  meetings: [
    {
      id: 1,
      name: 'Weekly Team Sync',
      date: '2025-03-10',
      attendees: ['John Doe', 'Jane Smith'],
      summary: 'Discussed progress on marketing materials and development timeline.'
    },
    {
      id: 2,
      name: 'Product Planning',
      date: '2025-03-12',
      attendees: ['John Doe', 'Mike Johnson'],
      summary: 'Reviewed feature prioritization and technical requirements.'
    },
    {
      id: 3,
      name: 'Design Review',
      date: '2025-03-08',
      attendees: ['Sarah Williams', 'John Doe', 'Jane Smith'],
      summary: 'Finalized UI designs for the product landing page and onboarding flow.'
    }
  ],
  timeline: [
    {
      id: '1',
      date: '2025-01-15',
      title: 'Project Kickoff',
      description: 'Initial planning and team assembly',
      type: 'milestone',
      meetingReference: null
    },
    {
      id: '2',
      date: '2025-02-01',
      title: 'Requirements Finalized',
      description: 'Product requirements document approved by stakeholders',
      type: 'milestone',
      meetingReference: null
    },
    {
      id: '3',
      date: '2025-02-15',
      title: 'Design Phase Complete',
      description: 'UI/UX designs finalized and approved',
      type: 'milestone',
      meetingReference: null
    },
    {
      id: '4',
      date: '2025-03-08',
      title: 'Landing Page Design Approved',
      description: 'Team approved the final designs for the product landing page',
      type: 'decision',
      meetingReference: 3
    },
    {
      id: '5',
      date: '2025-03-12',
      title: 'Feature Prioritization',
      description: 'Team decided to focus on core features for initial release',
      type: 'decision',
      meetingReference: 2
    }
  ],
  knowledgeBase: {
    sections: [
      {
        id: '1',
        title: 'Product Overview',
        content: 'Our new product is a cloud-based solution designed to streamline workflow management for small to medium businesses. It integrates with existing tools and provides a unified dashboard for task management, communication, and analytics.',
        aiGenerated: true,
        lastUpdated: '2025-03-12',
        sourceReferences: [
          { meetingId: 1, timestamp: 120 },
          { meetingId: 2, timestamp: 300 }
        ]
      },
      {
        id: '2',
        title: 'Target Audience',
        content: 'The primary target audience is small to medium businesses with 10-100 employees, particularly those in the professional services industry. Secondary audiences include freelancers and enterprise departments seeking lightweight solutions.',
        aiGenerated: true,
        lastUpdated: '2025-03-10',
        sourceReferences: [
          { meetingId: 1, timestamp: 450 }
        ]
      },
      {
        id: '3',
        title: 'Marketing Strategy',
        content: 'Our marketing strategy focuses on digital channels, including content marketing, social media campaigns, and targeted ads. We will also leverage partnerships with industry influencers and attend key trade shows.',
        aiGenerated: true,
        lastUpdated: '2025-03-12',
        sourceReferences: [
          { meetingId: 2, timestamp: 780 }
        ]
      }
    ]
  },
  goals: [
    {
      id: '1',
      title: 'Complete Beta Testing',
      description: 'Conduct beta testing with 50 users and collect feedback',
      status: 'in-progress',
      dueDate: '2025-04-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Finalize Marketing Materials',
      description: 'Create all marketing assets for the launch campaign',
      status: 'in-progress',
      dueDate: '2025-05-01',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Prepare Sales Team',
      description: 'Train sales team on product features and pricing',
      status: 'not-started',
      dueDate: '2025-05-15',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Launch Product',
      description: 'Official product launch and press release',
      status: 'not-started',
      dueDate: '2025-06-01',
      priority: 'high'
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Implement user feedback system',
      description: 'Add in-app feedback collection for beta users',
      status: 'in-progress',
      assigneeId: 3,
      assigneeName: 'Mike Johnson',
      dueDate: '2025-03-25',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Design email templates',
      description: 'Create email templates for onboarding and notifications',
      status: 'to-do',
      assigneeId: 4,
      assigneeName: 'Sarah Williams',
      dueDate: '2025-03-30',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Prepare press release',
      description: 'Draft press release for product launch',
      status: 'to-do',
      assigneeId: 2,
      assigneeName: 'Jane Smith',
      dueDate: '2025-04-15',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Set up analytics',
      description: 'Implement analytics tracking for key user actions',
      status: 'to-do',
      assigneeId: 3,
      assigneeName: 'Mike Johnson',
      dueDate: '2025-04-10',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Conduct QA testing',
      description: 'Perform thorough QA testing before beta release',
      status: 'to-do',
      assigneeId: 5,
      assigneeName: 'Alex Brown',
      dueDate: '2025-04-05',
      priority: 'high'
    }
  ]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id
  
  const [project, setProject] = useState(mockProject)
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'meetings' | 'tasks'>('overview')
  
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
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-neutral-400 hover:text-white flex items-center gap-1"
        >
          ← Back to Projects
        </Link>
      </div>
      
      {/* Project header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${
            project.status === 'active' ? 'bg-green-900/50 text-green-400' :
            project.status === 'planning' ? 'bg-blue-900/50 text-blue-400' :
            project.status === 'completed' ? 'bg-neutral-700 text-neutral-300' :
            'bg-amber-900/50 text-amber-400'
          }`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        
        <p className="text-neutral-300 mb-4">{project.description}</p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-neutral-400 mb-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{project.members.length} team members</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>{project.progress}% complete</span>
          </div>
        </div>
        
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden mb-6">
          <div 
            className={`h-full ${
              project.progress < 30 ? 'bg-blue-500' :
              project.progress < 70 ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {project.members.slice(0, 5).map(member => (
            <Link
              key={member.id}
              href={`/people/${member.id}`}
              className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full text-sm hover:bg-neutral-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <span>{member.firstName} {member.lastName}</span>
              <span className="text-neutral-500">({member.role})</span>
            </Link>
          ))}
          
          {project.members.length > 5 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full text-sm">
              +{project.members.length - 5} more
            </div>
          )}
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
              activeTab === 'knowledge'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge Base
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
              activeTab === 'tasks'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="glass-panel p-6">
        {activeTab === 'overview' && (
          <div>
            {/* Timeline */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Timeline</h2>
              <div className="relative pl-8 border-l border-neutral-700 space-y-8">
                {project.timeline.map(event => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-10 w-5 h-5 rounded-full bg-neutral-700 border-2 border-neutral-900 flex items-center justify-center">
                      {event.type === 'milestone' ? '🏆' : '🔍'}
                    </div>
                    <div className="mb-1 text-neutral-400">{formatDate(event.date)}</div>
                    <h3 className="text-lg font-medium mb-1">{event.title}</h3>
                    <p className="text-neutral-300">{event.description}</p>
                    {event.meetingReference && (
                      <Link
                        href={`/meetings/${event.meetingReference}`}
                        className="text-primary-400 hover:text-primary-300 text-sm inline-block mt-2"
                      >
                        View meeting →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Goals */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Goals</h2>
              <div className="space-y-4">
                {project.goals.map(goal => (
                  <div key={goal.id} className="p-4 bg-neutral-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{goal.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                        goal.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-neutral-700 text-neutral-300'
                      }`}>
                        {goal.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <p className="text-neutral-300 mb-2">{goal.description}</p>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <span>📅</span>
                      <span>Due: {formatDate(goal.dueDate)}</span>
                      <span>•</span>
                      <span className={`
                        ${goal.priority === 'high' ? 'text-red-400' : ''}
                        ${goal.priority === 'medium' ? 'text-yellow-400' : ''}
                        ${goal.priority === 'low' ? 'text-green-400' : ''}
                      `}>
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
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
                {project.meetings.slice(0, 3).map(meeting => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-all"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{meeting.name}</h3>
                      <span className="text-neutral-500">{formatDate(meeting.date)}</span>
                    </div>
                    <p className="text-neutral-300 text-sm mb-2">{meeting.summary}</p>
                    <div className="text-sm text-neutral-400">
                      Attendees: {meeting.attendees.join(', ')}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'knowledge' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Knowledge Base</h2>
            
            <div className="space-y-8">
              {project.knowledgeBase.sections.map(section => (
                <div key={section.id} className="border-b border-neutral-800 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-medium">{section.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{section.aiGenerated ? 'AI Generated' : 'User Generated'}</span>
                      <span>•</span>
                      <span>Updated: {formatDate(section.lastUpdated)}</span>
                    </div>
                  </div>
                  
                  <div className={`mb-4 ${section.aiGenerated ? 'ai-generated' : 'user-generated'}`}>
                    <p className="text-neutral-300">{section.content}</p>
                  </div>
                  
                  {section.sourceReferences && section.sourceReferences.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-2">Sources:</h4>
                      <div className="space-y-1">
                        {section.sourceReferences.map((ref, index) => (
                          <Link
                            key={index}
                            href={`/meetings/${ref.meetingId}`}
                            className="text-primary-400 hover:text-primary-300 text-sm block"
                          >
                            Meeting #{ref.meetingId} at {Math.floor(ref.timestamp / 60)}:{(ref.timestamp % 60).toString().padStart(2, '0')}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'meetings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Project Meetings</h2>
            
            <div className="space-y-4">
              {project.meetings.map(meeting => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="block p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-all"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{meeting.name}</h3>
                    <span className="text-neutral-500">{formatDate(meeting.date)}</span>
                  </div>
                  <p className="text-neutral-300 text-sm mb-2">{meeting.summary}</p>
                  <div className="text-sm text-neutral-400">
                    Attendees: {meeting.attendees.join(', ')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <button className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg">
                + Add Task
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-neutral-400"></span>
                  To Do
                </h3>
                <div className="space-y-3">
                  {project.tasks.filter(task => task.status === 'to-do').map(task => (
                    <div key={task.id} className="p-3 bg-neutral-800/50 rounded-lg">
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      <p className="text-sm text-neutral-300 mb-2">{task.description}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>👤 {task.assigneeName}</span>
                        <span>•</span>
                        <span>📅 {formatDate(task.dueDate)}</span>
                        <span>•</span>
                        <span className={`
                          ${task.priority === 'high' ? 'text-red-400' : ''}
                          ${task.priority === 'medium' ? 'text-yellow-400' : ''}
                          ${task.priority === 'low' ? 'text-green-400' : ''}
                        `}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* In Progress Column */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  In Progress
                </h3>
                <div className="space-y-3">
                  {project.tasks.filter(task => task.status === 'in-progress').map(task => (
                    <div key={task.id} className="p-3 bg-neutral-800/50 rounded-lg">
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      <p className="text-sm text-neutral-300 mb-2">{task.description}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>👤 {task.assigneeName}</span>
                        <span>•</span>
                        <span>📅 {formatDate(task.dueDate)}</span>
                        <span>•</span>
                        <span className={`
                          ${task.priority === 'high' ? 'text-red-400' : ''}
                          ${task.priority === 'medium' ? 'text-yellow-400' : ''}
                          ${task.priority === 'low' ? 'text-green-400' : ''}
                        `}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Completed Column */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  Completed
                </h3>
                <div className="space-y-3">
                  {project.tasks.filter(task => task.status === 'completed').length > 0 ? (
                    project.tasks.filter(task => task.status === 'completed').map(task => (
                      <div key={task.id} className="p-3 bg-neutral-800/50 rounded-lg">
                        <h4 className="font-medium mb-1">{task.title}</h4>
                        <p className="text-sm text-neutral-300 mb-2">{task.description}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>👤 {task.assigneeName}</span>
                          <span>•</span>
                          <span>📅 {formatDate(task.dueDate)}</span>
                          <span>•</span>
                          <span className={`
                            ${task.priority === 'high' ? 'text-red-400' : ''}
                            ${task.priority === 'medium' ? 'text-yellow-400' : ''}
                            ${task.priority === 'low' ? 'text-green-400' : ''}
                          `}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-neutral-800/20 rounded-lg text-center text-neutral-500">
                      No completed tasks yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
