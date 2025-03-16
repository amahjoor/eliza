'use client'

import React, { useEffect, useRef } from 'react'

interface Node {
  id: string;
  label: string;
  type: string;
  value: number;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  value?: number;
  title?: string;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

export default function KnowledgeGraph({ 
  nodes, 
  edges, 
  height = 500,
  onNodeClick
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // This would normally use vis-network or a similar library
    // For now, we'll create a mock visualization
    if (!containerRef.current) return
    
    // Clear previous content
    containerRef.current.innerHTML = ''
    
    // Create a mock visualization
    const mockVisualization = document.createElement('div')
    mockVisualization.style.width = '100%'
    mockVisualization.style.height = `${height}px`
    mockVisualization.style.position = 'relative'
    mockVisualization.style.backgroundColor = 'rgba(30, 30, 30, 0.5)'
    mockVisualization.style.borderRadius = '8px'
    mockVisualization.style.overflow = 'hidden'
    
    // Add a message about the mock implementation
    const message = document.createElement('div')
    message.style.position = 'absolute'
    message.style.top = '50%'
    message.style.left = '50%'
    message.style.transform = 'translate(-50%, -50%)'
    message.style.textAlign = 'center'
    message.innerHTML = `
      <div style="margin-bottom: 16px; font-size: 24px;">🧠</div>
      <div style="font-weight: 500; margin-bottom: 8px;">Knowledge Graph Visualization</div>
      <div style="color: #9ca3af; font-size: 14px;">
        ${nodes.length} nodes and ${edges.length} connections
      </div>
    `
    
    mockVisualization.appendChild(message)
    containerRef.current.appendChild(mockVisualization)
    
    // Add click handler for the entire visualization
    mockVisualization.addEventListener('click', () => {
      if (nodes.length > 0 && onNodeClick) {
        // Simulate clicking a random node
        const randomIndex = Math.floor(Math.random() * nodes.length)
        onNodeClick(nodes[randomIndex].id)
      }
    })
  }, [nodes, edges, height, onNodeClick])
  
  return (
    <div ref={containerRef} className="knowledge-graph-container" />
  )
}
