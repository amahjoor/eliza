'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  type: 'meeting' | 'person' | 'project' | 'knowledge';
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showResults?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className = '',
  showResults = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Debounce search input
  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      const mockResults = getMockSearchResults(searchQuery);
      setResults(mockResults);
      setIsOpen(true);
      
      if (onSearch) {
        onSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    }
  };
  
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'person':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'knowledge':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
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
  
  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case 'meeting':
        return result.name;
      case 'person':
        return `${result.firstName} ${result.lastName}`;
      case 'project':
        return result.name;
      case 'knowledge':
        return result.title;
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full p-2 pl-10 bg-background-light border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-2.5 text-gray-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {showResults && isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-background-light border border-white/10 rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={getResultLink(result)}
                onClick={() => setIsOpen(false)}
                className="flex items-center p-2 hover:bg-background rounded-md transition-colors"
              >
                <div className="mr-3 text-gray-400">
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1">
                  <div className="text-white">{getResultTitle(result)}</div>
                  <div className="text-xs text-gray-400 capitalize">{result.type}</div>
                </div>
              </Link>
            ))}
            
            {query && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-2 text-primary text-sm hover:bg-background rounded-md transition-colors"
                >
                  View all results for "{query}"
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Mock search results for development
const getMockSearchResults = (query: string): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  
  const allResults: SearchResult[] = [
    { id: '1', name: 'Weekly Team Meeting', type: 'meeting' },
    { id: '2', name: 'Product Roadmap Discussion', type: 'meeting' },
    { id: '3', name: 'Customer Feedback Review', type: 'meeting' },
    { id: '4', firstName: 'John', lastName: 'Smith', type: 'person' },
    { id: '5', firstName: 'Sarah', lastName: 'Johnson', type: 'person' },
    { id: '6', firstName: 'Michael', lastName: 'Brown', type: 'person' },
    { id: '7', name: 'Website Redesign', type: 'project' },
    { id: '8', name: 'Mobile App Development', type: 'project' },
    { id: '9', name: 'Marketing Campaign', type: 'project' },
    { id: '10', title: 'Product Roadmap 2023', type: 'knowledge' },
    { id: '11', title: 'Customer Feedback Analysis', type: 'knowledge' },
    { id: '12', title: 'Engineering Team Structure', type: 'knowledge' }
  ];
  
  return allResults.filter(result => {
    if (result.type === 'meeting' && result.name?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    if (result.type === 'person' && 
        (`${result.firstName} ${result.lastName}`.toLowerCase().includes(lowerQuery) ||
         result.firstName?.toLowerCase().includes(lowerQuery) ||
         result.lastName?.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    if (result.type === 'project' && result.name?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    if (result.type === 'knowledge' && result.title?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    return false;
  }).slice(0, 5); // Limit to 5 results for the dropdown
};

export default SearchBar;
