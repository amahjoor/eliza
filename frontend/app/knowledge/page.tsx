'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import Link from 'next/link'
import KnowledgeGraph from '../../components/KnowledgeGraph'

export default function KnowledgePage() {
  const { user, loading: authLoading } = useAuth()
  const [knowledgeItems, setKnowledgeItems] = useState<Array<{
    id: string;
    title: string;
    type: string;
    source: string;
    relevance: number;
    tags: string[];
    excerpt: string;
  }>>([])
  const [graphData, setGraphData] = useState<{
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      value: number;
    }>;
    edges: Array<{
      from: string;
      to: string;
      label?: string;
      value?: number;
      title?: string;
    }>;
  }>({ nodes: [], edges: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeItem, setActiveItem] = useState<number | null>(null)
  
  // Fetch knowledge data when user is authenticated
  useEffect(() => {
    if (!user) return
    
    const fetchKnowledgeEntries = async () => {
      try {
        const response = await fetch('/api/knowledge', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setKnowledgeItems(data)
        } else {
          setError('Failed to fetch knowledge entries')
        }
      } catch (error) {
        console.error('Error fetching knowledge entries:', error)
        setError('Error connecting to server')
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchKnowledgeGraph = async () => {
      try {
        const response = await fetch('/api/knowledge/graph', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Transform data for the KnowledgeGraph component
          const nodes = data.nodes.map((node: any) => ({
            id: node.id,
            label: node.title || node.label,
            type: node.type || 'concept',
            value: node.relevance || 1
          }))
          
          const edges = data.edges.map((edge: any) => ({
            from: edge.source,
            to: edge.target,
            label: edge.description,
            value: edge.strength,
            title: edge.type
          }))
          
          setGraphData({ nodes, edges })
        }
      } catch (error) {
        console.error('Error fetching knowledge graph:', error)
      }
    }
    
    fetchKnowledgeEntries()
    fetchKnowledgeGraph()
  }, [user])
  
  // If loading auth or data, show loading indicator
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-panel p-8 text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-medium mb-2">Loading Knowledge Base...</h3>
          <p className="text-neutral-400">
            Retrieving your organization's knowledge
          </p>
        </div>
      </div>
    )
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-panel p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium mb-2">Error Loading Knowledge Base</h3>
          <p className="text-neutral-400">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  // Get all unique tags
  const allTags = Array.from(new Set(
    knowledgeItems.flatMap(item => item.tags)
  )).sort()
  
  // Filter knowledge items based on search and tags
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => item.tags.includes(tag))
    
    return matchesSearch && matchesTags
  })
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg flex items-center transition-all">
            <span className="mr-2">🔄</span> Refresh
          </button>
          
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all">
            <span className="mr-2">📊</span> Visualize
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Knowledge Graph Visualization */}
      <div className="glass-panel p-6 mb-8">
        {graphData.nodes.length > 0 ? (
          <KnowledgeGraph 
            nodes={graphData.nodes} 
            edges={graphData.edges} 
            height={400}
            onNodeClick={(nodeId) => {
              // Find the knowledge item with this ID and set it as active
              const item = knowledgeItems.find(item => item.id === nodeId)
              if (item) {
                setActiveItem(item.id)
                // Scroll to the item
                document.getElementById(`knowledge-item-${item.id}`)?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'center'
                })
              }
            }}
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-medium mb-2">No Knowledge Graph Data</h3>
              <p className="text-neutral-400">
                Start recording meetings to build your knowledge graph
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Knowledge Items */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={item.id}
              id={`knowledge-item-${item.id}`}
              className={`glass-panel p-5 hover:bg-neutral-800/50 transition-all cursor-pointer ${
                activeItem === item.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300">
                  {item.type}
                </span>
              </div>
              
              <p className="text-neutral-300 text-sm mb-4">
                {item.excerpt}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{item.source}</span>
                <span>Relevance: {item.relevance}%</span>
              </div>
              
              {activeItem === item.id && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors">
                      View Source
                    </button>
                    <button className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors">
                      Related Items
                    </button>
                    <button className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors">
                      Export
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No knowledge items found</h3>
            <p className="text-neutral-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
