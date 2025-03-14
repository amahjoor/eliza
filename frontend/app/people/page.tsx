'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// Mock data for people
const getPeopleData = () => {
  return [
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Product Manager',
      organization: 'Product Team',
      email: 'alex.johnson@example.com',
      meetingsCount: 24,
      lastMeeting: new Date('2023-11-15T14:30:00'),
      networkConnectivity: 0.8,
      aiSummary: 'Alex is a frequent contributor in product planning meetings, focusing on roadmap and feature prioritization. Often leads discussions and assigns action items.',
      tags: ['Product', 'Leadership', 'Strategy']
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Lead Developer',
      organization: 'Engineering',
      email: 'sarah.chen@example.com',
      meetingsCount: 18,
      lastMeeting: new Date('2023-11-14T10:00:00'),
      networkConnectivity: 0.7,
      aiSummary: 'Sarah provides technical insights and implementation details in meetings. Focuses on feasibility and technical constraints of proposed features.',
      tags: ['Engineering', 'Technical', 'Architecture']
    },
    {
      id: '3',
      name: 'Miguel Rodriguez',
      role: 'UX Designer',
      organization: 'Design',
      email: 'miguel.rodriguez@example.com',
      meetingsCount: 15,
      lastMeeting: new Date('2023-11-15T14:30:00'),
      networkConnectivity: 0.6,
      aiSummary: 'Miguel advocates for user experience considerations in product discussions. Provides design perspectives and user research insights.',
      tags: ['Design', 'UX', 'Research']
    },
    {
      id: '4',
      name: 'Taylor Kim',
      role: 'Marketing Director',
      organization: 'Marketing',
      email: 'taylor.kim@example.com',
      meetingsCount: 12,
      lastMeeting: new Date('2023-11-13T15:00:00'),
      networkConnectivity: 0.5,
      aiSummary: 'Taylor brings marketing perspective to product discussions. Focuses on go-to-market strategy, messaging, and customer acquisition.',
      tags: ['Marketing', 'Strategy', 'Communications']
    }
  ];
};

const PersonCard = ({ person }: { person: any }) => {
  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{person.name}</h3>
          <p className="text-gray-400">{person.role} • {person.organization}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-400">{person.meetingsCount} meetings</div>
          <div className="text-sm text-gray-400">Last: {person.lastMeeting.toLocaleDateString()}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">AI Summary</div>
        <p className="text-white">{person.aiSummary}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap">
          {person.tags.map((tag: string, index: number) => (
            <div 
              key={index} 
              className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs"
            >
              {tag}
            </div>
          ))}
        </div>
        
        <Link href={`/people/${person.id}`} className="glass-button text-sm">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default function PeoplePage() {
  const [people, setPeople] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch people from an API
    // For now, we'll use our mock data function
    const data = getPeopleData();
    setPeople(data);
  }, []);
  
  const filteredPeople = people.filter(person => {
    const matchesSearch = searchTerm === '' || 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === '' || 
      person.tags.some((tag: string) => tag.toLowerCase() === filterTag.toLowerCase());
    
    return matchesSearch && matchesTag;
  });
  
  const allTags = Array.from(
    new Set(people.flatMap(person => person.tags))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">People</h1>
          <button className="primary-button">
            Add Person
          </button>
        </div>
        
        <div className="glass-panel p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search people..."
                className="w-full p-2 bg-background-light border border-white/10 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <select
                className="p-2 bg-background-light border border-white/10 rounded-md"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map((tag, index) => (
                  <option key={index} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPeople.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
          
          {filteredPeople.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No people found. Try adjusting your filters or add a new person.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
