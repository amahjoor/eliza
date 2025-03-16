'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  id: number
  name?: string
  title?: string
  firstName?: string
  lastName?: string
  startTime?: string
  type: 'meeting' | 'note' | 'transcript' | 'person' | 'project'
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Debounce search
  useEffect(() => {
    if (!query) {
      setResults([])
      setIsOpen(false)
      return
    }
    
    const timer = setTimeout(() => {
      performSearch()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query])
  
  const performSearch = async () => {
    if (!query) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      // Process and combine results
      const combinedResults: SearchResult[] = [
        ...processResults(data.meetings || [], 'meeting'),
        ...processResults(data.notes || [], 'note'),
        ...processResults(data.transcripts || [], 'transcript'),
        ...processResults(data.people || [], 'person'),
        ...processResults(data.projects || [], 'project')
      ]
      
      setResults(combinedResults.slice(0, 10))
      setIsOpen(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const processResults = (items: any[], type: SearchResult['type']): SearchResult[] => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      title: item.title,
      firstName: item.firstName,
      lastName: item.lastName,
      startTime: item.startTime,
      type
    }))
  }
  
  const getResultLink = (result: SearchResult): string => {
    switch (result.type) {
      case 'meeting':
        return `/meetings/${result.id}`
      case 'note':
        return `/meetings/${result.id}?tab=notes`
      case 'transcript':
        return `/meetings/${result.id}?tab=transcript`
      case 'person':
        return `/people/${result.id}`
      case 'project':
        return `/projects/${result.id}`
      default:
        return '/'
    }
  }
  
  const getResultTitle = (result: SearchResult): string => {
    switch (result.type) {
      case 'meeting':
        return result.name || 'Untitled Meeting'
      case 'note':
        return result.title || 'Untitled Note'
      case 'transcript':
        return `Transcript: ${result.name || 'Untitled Meeting'}`
      case 'person':
        return `${result.firstName} ${result.lastName}`
      case 'project':
        return result.name || 'Untitled Project'
      default:
        return 'Unknown Result'
    }
  }
  
  const getResultIcon = (result: SearchResult): string => {
    switch (result.type) {
      case 'meeting':
        return '📅'
      case 'note':
        return '📝'
      case 'transcript':
        return '🎤'
      case 'person':
        return '👤'
      case 'project':
        return '📂'
      default:
        return '📄'
    }
  }
  
  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search meetings, notes, people..."
          className="w-full px-4 py-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={getResultLink(result)}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 hover:bg-neutral-700 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <span className="mr-2">{getResultIcon(result)}</span>
                  <div>
                    <div className="font-medium">{getResultTitle(result)}</div>
                    <div className="text-xs text-neutral-400">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      {result.startTime && ` • ${new Date(result.startTime).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg p-4 text-center">
          <p className="text-neutral-400">No results found</p>
        </div>
      )}
    </div>
  )
}
