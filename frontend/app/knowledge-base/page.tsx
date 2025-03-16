'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// Mock data for knowledge base entries
const getKnowledgeBaseData = () => {
  return [
    {
      id: '1',
      title: 'Product Roadmap Discussion',
      content: 'In our roadmap discussion, we decided to prioritize the mobile app redesign for Q3, followed by the API overhaul in Q4. The team agreed that improving user onboarding should be our top priority for increasing retention.',
      tags: ['Product', 'Roadmap', 'Mobile'],
      source: 'Meeting: Product Strategy',
      sourceType: 'meeting',
      createdAt: new Date('2023-11-10T14:30:00')
    },
    {
      id: '2',
      title: 'Customer Feedback Analysis',
      content: 'Analysis of recent customer feedback shows that users are struggling with the checkout process. The main pain points are: 1) Too many form fields, 2) Confusing validation errors, 3) Slow loading times between steps.',
      tags: ['Customer Feedback', 'UX', 'Checkout'],
      source: 'Meeting: Customer Success Review',
      sourceType: 'meeting',
      createdAt: new Date('2023-11-05T10:00:00')
    },
    {
      id: '3',
      title: 'Engineering Team Structure',
      content: 'We\'ve decided to reorganize the engineering team into three focused groups: Platform, User Experience, and Data. Each group will have a tech lead who reports to the CTO. This structure aims to improve ownership and accountability.',
      tags: ['Engineering', 'Team Structure', 'Organization'],
      source: 'Meeting: Engineering Planning',
      sourceType: 'meeting',
      createdAt: new Date('2023-10-28T15:00:00')
    },
    {
      id: '4',
      title: 'Marketing Campaign Results',
      content: 'The Q4 marketing campaign resulted in a 27% increase in new user signups and a 15% increase in returning user engagement. The most effective channel was social media, particularly Instagram, which drove 45% of new traffic.',
      tags: ['Marketing', 'Campaign', 'Analytics'],
      source: 'Manual Entry',
      sourceType: 'manual',
      createdAt: new Date('2023-11-12T09:30:00')
    },
    {
      id: '5',
      title: 'New Feature Specifications',
      content: 'The new collaborative editing feature will support real-time editing for up to 10 simultaneous users. It will include presence indicators, cursor tracking, and conflict resolution. The MVP will focus on text documents, with support for rich media coming in phase 2.',
      tags: ['Product', 'Specifications', 'Collaboration'],
      source: 'Meeting: Product Planning',
      sourceType: 'meeting',
      createdAt: new Date('2023-11-08T11:00:00')
    }
  ];
};

const KnowledgeBaseCard = ({ entry }: { entry: any }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold">{entry.title}</h3>
        <div className="text-sm text-gray-400">{formatDate(entry.createdAt)}</div>
      </div>
      
      <p className="text-gray-300 mb-4 line-clamp-3">{entry.content}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap">
          {entry.tags.map((tag: string, index: number) => (
            <div 
              key={index} 
              className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs"
            >
              {tag}
            </div>
          ))}
        </div>
        
        <div className="flex items-center">
          <div className="text-sm text-gray-400 mr-4">
            Source: {entry.source}
          </div>
          <Link href={`/knowledge-base/${entry.id}`} className="glass-button text-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const InsightsPanel = () => {
  return (
    <div className="glass-panel p-6 rounded-xl mb-8">
      <h3 className="text-xl font-bold mb-4">Knowledge Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-background-light p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Top Topics</div>
          <div className="flex flex-wrap">
            <div className="mr-2 mb-2 px-3 py-1 bg-primary/20 rounded-full text-white text-xs">Product (12)</div>
            <div className="mr-2 mb-2 px-3 py-1 bg-primary/20 rounded-full text-white text-xs">UX (8)</div>
            <div className="mr-2 mb-2 px-3 py-1 bg-primary/20 rounded-full text-white text-xs">Engineering (7)</div>
          </div>
        </div>
        
        <div className="bg-background-light p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Recent Activity</div>
          <div className="text-sm">
            <div className="mb-1">5 new entries this week</div>
            <div className="mb-1">Most active: Product team</div>
          </div>
        </div>
        
        <div className="bg-background-light p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Suggested Topics</div>
          <div className="flex flex-wrap">
            <div className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs">Mobile App</div>
            <div className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs">Customer Feedback</div>
          </div>
        </div>
      </div>
      
      <Link href="/knowledge-base/insights" className="text-primary text-sm">
        View detailed insights →
      </Link>
    </div>
  );
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterSource, setFilterSource] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch knowledge base entries from an API
    // For now, we'll use our mock data function
    const data = getKnowledgeBaseData();
    setEntries(data);
  }, []);
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === '' || 
      entry.tags.some((tag: string) => tag.toLowerCase() === filterTag.toLowerCase());
    
    const matchesSource = filterSource === '' || entry.sourceType === filterSource;
    
    return matchesSearch && matchesTag && matchesSource;
  });
  
  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <button className="primary-button">
            Add Entry
          </button>
        </div>
        
        <InsightsPanel />
        
        <div className="glass-panel p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search knowledge base..."
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
            
            <div>
              <select
                className="p-2 bg-background-light border border-white/10 rounded-md"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="meeting">Meetings</option>
                <option value="manual">Manual Entries</option>
                <option value="import">Imported</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {filteredEntries.map(entry => (
            <KnowledgeBaseCard key={entry.id} entry={entry} />
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No knowledge base entries found. Try adjusting your filters or add a new entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
