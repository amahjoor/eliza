'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';

// Mock search results
const getMockSearchResults = (query: string) => {
  const lowerQuery = query.toLowerCase();
  
  const meetings = [
    { id: '1', name: 'Weekly Team Meeting', date: '2023-11-15T10:00:00', type: 'meeting' },
    { id: '2', name: 'Product Roadmap Discussion', date: '2023-11-10T14:30:00', type: 'meeting' },
    { id: '3', name: 'Customer Feedback Review', date: '2023-11-05T11:00:00', type: 'meeting' }
  ].filter(meeting => meeting.name.toLowerCase().includes(lowerQuery));
  
  const people = [
    { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', type: 'person' },
    { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', type: 'person' },
    { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', type: 'person' }
  ].filter(person => 
    `${person.firstName} ${person.lastName}`.toLowerCase().includes(lowerQuery) ||
    person.firstName.toLowerCase().includes(lowerQuery) ||
    person.lastName.toLowerCase().includes(lowerQuery) ||
    person.email.toLowerCase().includes(lowerQuery)
  );
  
  const projects = [
    { id: '1', name: 'Website Redesign', description: 'Redesign the company website', type: 'project' },
    { id: '2', name: 'Mobile App Development', description: 'Develop a new mobile app', type: 'project' },
    { id: '3', name: 'Marketing Campaign', description: 'Q4 marketing campaign', type: 'project' }
  ].filter(project => 
    project.name.toLowerCase().includes(lowerQuery) ||
    project.description.toLowerCase().includes(lowerQuery)
  );
  
  const knowledgeBase = [
    { 
      id: '1', 
      title: 'Product Roadmap 2023', 
      content: 'Details of the product roadmap for 2023',
      tags: ['Product', 'Roadmap', 'Planning'],
      type: 'knowledge'
    },
    { 
      id: '2', 
      title: 'Customer Feedback Analysis', 
      content: 'Analysis of recent customer feedback',
      tags: ['Customer', 'Feedback', 'Analysis'],
      type: 'knowledge'
    },
    { 
      id: '3', 
      title: 'Engineering Team Structure', 
      content: 'Overview of the engineering team structure',
      tags: ['Engineering', 'Team', 'Organization'],
      type: 'knowledge'
    }
  ].filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
  
  return {
    meetings,
    people,
    projects,
    knowledgeBase
  };
};

const SearchResultCard = ({ result, type }: { result: any, type: string }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getResultLink = () => {
    switch (type) {
      case 'meeting':
        return `/meetings/${result.id}`;
      case 'person':
        return `/people/${result.id}`;
      case 'project':
        return `/projects/${result.id}`;
      case 'knowledge':
        return `/knowledge-base/${result.id}`;
      default:
        return '#';
    }
  };
  
  const getResultIcon = () => {
    switch (type) {
      case 'meeting':
        return (
          <div className="p-3 bg-primary/20 rounded-full">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'person':
        return (
          <div className="p-3 bg-blue-500/20 rounded-full">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'project':
        return (
          <div className="p-3 bg-green-500/20 rounded-full">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        );
      case 'knowledge':
        return (
          <div className="p-3 bg-purple-500/20 rounded-full">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="glass-panel p-4 rounded-xl mb-4">
      <div className="flex items-start">
        <div className="mr-4">
          {getResultIcon()}
        </div>
        <div className="flex-1">
          <Link href={getResultLink()} className="text-lg font-semibold hover:text-primary transition-colors">
            {type === 'person' ? `${result.firstName} ${result.lastName}` : (result.name || result.title)}
          </Link>
          
          <div className="text-sm text-gray-400 mt-1 capitalize">
            {type}
            {result.date && ` • ${formatDate(result.date)}`}
            {result.email && ` • ${result.email}`}
          </div>
          
          {result.description && (
            <p className="text-gray-300 mt-2">{result.description}</p>
          )}
          
          {result.content && (
            <p className="text-gray-300 mt-2">{result.content}</p>
          )}
          
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {result.tags.map((tag: string, index: number) => (
                <div 
                  key={index} 
                  className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchResultsSection = ({ title, results, type }: { title: string, results: any[], type: string }) => {
  if (results.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={`/search/${type}?q=${encodeURIComponent(query)}`} className="text-primary text-sm">
          View all {title.toLowerCase()}
        </Link>
      </div>
      
      <div>
        {results.map((result) => (
          <SearchResultCard key={`${type}-${result.id}`} result={result} type={type} />
        ))}
      </div>
    </div>
  );
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any>({
    meetings: [],
    people: [],
    projects: [],
    knowledgeBase: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (!query) return;
    
    setIsLoading(true);
    
    // In a real app, this would be an API call
    // For now, we'll use our mock data function
    const searchResults = getMockSearchResults(query);
    
    // Simulate API delay
    setTimeout(() => {
      setResults(searchResults);
      setIsLoading(false);
    }, 500);
  }, [query]);
  
  const totalResults = 
    results.meetings.length + 
    results.people.length + 
    results.projects.length + 
    results.knowledgeBase.length;
  
  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-400">Searching for "{query}"...</p>
        </div>
      );
    }
    
    if (query && totalResults === 0) {
      return (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-400">No results found for "{query}"</p>
          <p className="mt-2 text-gray-500">Try using different keywords or filters</p>
        </div>
      );
    }
    
    if (activeTab === 'all') {
      return (
        <>
          <SearchResultsSection title="Meetings" results={results.meetings} type="meeting" />
          <SearchResultsSection title="People" results={results.people} type="person" />
          <SearchResultsSection title="Projects" results={results.projects} type="project" />
          <SearchResultsSection title="Knowledge Base" results={results.knowledgeBase} type="knowledge" />
        </>
      );
    }
    
    if (activeTab === 'meetings') {
      return <SearchResultsSection title="Meetings" results={results.meetings} type="meeting" />;
    }
    
    if (activeTab === 'people') {
      return <SearchResultsSection title="People" results={results.people} type="person" />;
    }
    
    if (activeTab === 'projects') {
      return <SearchResultsSection title="Projects" results={results.projects} type="project" />;
    }
    
    if (activeTab === 'knowledge') {
      return <SearchResultsSection title="Knowledge Base" results={results.knowledgeBase} type="knowledge" />;
    }
    
    return null;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search</h1>
          
          <SearchBar 
            placeholder="Search for meetings, people, projects, and more..." 
            className="w-full max-w-3xl"
            showResults={false}
          />
        </div>
        
        {query && (
          <div className="mb-6">
            <p className="text-gray-400">
              {isLoading ? 'Searching...' : `${totalResults} results for "${query}"`}
            </p>
          </div>
        )}
        
        <div className="flex border-b border-white/10 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'meetings' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setActiveTab('meetings')}
          >
            Meetings
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'people' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setActiveTab('people')}
          >
            People
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'projects' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'knowledge' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge Base
          </button>
        </div>
        
        {renderResults()}
      </div>
    </div>
  );
}
