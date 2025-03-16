'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface KnowledgeGraphProps {
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
  onNodeClick?: (nodeId: string) => void;
  width?: number;
  height?: number;
}

export default function KnowledgeGraph({ 
  nodes, 
  edges, 
  onNodeClick,
  width = 800,
  height = 600
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) {
      setIsLoading(true)
      return
    }
    
    setIsLoading(false)
    
    // Clear previous graph
    d3.select(containerRef.current).select('svg').remove()
    
    // Create SVG container
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')
    
    // Create links (edges)
    const links = edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      value: edge.value || 1,
      label: edge.label || '',
      title: edge.title || ''
    }))
    
    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
    
    // Add links
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value))
    
    // Add link labels
    const linkLabels = svg.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 8)
      .attr('fill', '#aaa')
      .text(d => d.label || '')
    
    // Define node colors based on type
    const colorScale = d3.scaleOrdinal()
      .domain(['concept', 'decision', 'technical', 'milestone', 'relationship'])
      .range(['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'])
    
    // Add nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.value) * 5 + 5)
      .attr('fill', d => colorScale(d.type) as string)
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d.id)
      })
    
    // Add node labels
    const nodeLabels = svg.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('font-size', 10)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', 3)
      .text(d => d.label)
    
    // Add tooltips
    node.append('title')
      .text(d => d.label)
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y)
      
      linkLabels
        .attr('x', d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr('y', d => ((d.source as any).y + (d.target as any).y) / 2)
      
      node
        .attr('cx', d => d.x = Math.max(20, Math.min(width - 20, d.x)))
        .attr('cy', d => d.y = Math.max(20, Math.min(height - 20, d.y)))
      
      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })
    
    // Cleanup function
    return () => {
      simulation.stop()
    }
  }, [nodes, edges, width, height, onNodeClick])
  
  // Drag function for nodes
  function drag(simulation: d3.Simulation<any, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  }
  
  return (
    <div className="w-full h-full">
      {isLoading ? (
        <div className="glass-panel p-6 text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-medium mb-2">Loading Knowledge Graph...</h3>
          <p className="text-neutral-400">
            Visualizing your organization's knowledge connections
          </p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Knowledge Graph</h3>
            <div className="text-sm text-neutral-400">
              {nodes.length} nodes • {edges.length} connections
            </div>
          </div>
          <div ref={containerRef} className="w-full" style={{ height: `${height}px` }}>
            {/* D3 will render the graph here */}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-indigo-600 mr-1"></span>
              <span>Concept</span>
            </div>
            <div className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-600 mr-1"></span>
              <span>Decision</span>
            </div>
            <div className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
              <span>Technical</span>
            </div>
            <div className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span>Milestone</span>
            </div>
            <div className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
              <span>Relationship</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
