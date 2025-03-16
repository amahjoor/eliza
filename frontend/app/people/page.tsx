'use client'

import React, { useState } from 'react'
import Link from 'next/link'

// Mock data for people
const mockPeople = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    organization: 'Acme Inc.',
    role: 'Product Manager',
    meetingCount: 15,
    networkConnectivity: 'high',
    aiSummary: 'John frequently leads discussions on product strategy and roadmap planning. He asks insightful questions and helps the team stay focused on key objectives.'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    organization: 'Acme Inc.',
    role: 'Marketing Director',
    meetingCount: 12,
    networkConnectivity: 'high',
    aiSummary: 'Jane brings valuable marketing insights to discussions. She often presents data-driven analyses and focuses on customer acquisition strategies.'
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    organization: 'Acme Inc.',
    role: 'Software Engineer',
    meetingCount: 8,
    networkConnectivity: 'medium',
    aiSummary: 'Mike provides technical expertise during meetings. He explains complex concepts clearly and offers practical solutions to implementation challenges.'
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    organization: 'Partner Co.',
    role: 'Client Success Manager',
    meetingCount: 5,
    networkConnectivity: 'medium',
    aiSummary: 'Sarah represents client interests and provides valuable feedback on product features. She communicates client needs effectively and helps prioritize development efforts.'
  }
]

export default function PeoplePage() {
  const [people, setPeople] = useState(mockPeople)
  const [searchQuery, setSearchQuery] = useState('')
  const [organizationFilter, setOrganizationFilter] = useState<string | null>(null)
  
  // Get unique organizations
  const organizations = Array.from(new Set(people.map(p => p.organization))).filter(Boolean) as string[]
  
  // Filter people based on search query and filters
  const filteredPeople = people.filter(person => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Organization filter
    const matchesOrganization = !organizationFilter || person.organization === organizationFilter
    
    return matchesSearch && matchesOrganization
  })
  
  // Sort people by meeting count (most active first)
  const sortedPeople = [...filteredPeople].sort((a, b) => b.meetingCount - a.meetingCount)
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">People</h1>
        
        <button
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all"
        >
          👤 Add Person
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search people..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={organizationFilter || ''}
            onChange={(e) => setOrganizationFilter(e.target.value || null)}
          >
            <option value="">All Organizations</option>
            {organizations.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* People List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPeople.length > 0 ? (
          sortedPeople.map(person => (
            <Link
              key={person.id}
              href={`/people/${person.id}`}
              className="glass-panel p-5 hover:bg-neutral-800/50 transition-all meeting-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-lg">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">{person.firstName} {person.lastName}</h3>
                  
                  <div className="text-sm text-neutral-400 mb-3">
                    <div className="mb-1">{person.role}</div>
                    <div className="mb-1">{person.organization}</div>
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span>{person.meetingCount} meetings</span>
                      <span>•</span>
                      <span className={`
                        ${person.networkConnectivity === 'high' ? 'text-green-400' : ''}
                        ${person.networkConnectivity === 'medium' ? 'text-yellow-400' : ''}
                        ${person.networkConnectivity === 'low' ? 'text-red-400' : ''}
                      `}>
                        {person.networkConnectivity} connectivity
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-neutral-300 line-clamp-3">
                    {person.aiSummary}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No people found</h3>
            <p className="text-neutral-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
