'use client'

import React, { useEffect, useRef } from 'react'

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
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

export default function KnowledgeGraph({ 
  nodes, 
  edges, 
  height = 400,
  onNodeClick 
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<any>(null)
  
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return
    
    // In a real implementation, this would use a library like vis.js
    // For now, we'll create a simple visualization using HTML/CSS
    const container = containerRef.current
    
    // Clear previous content
    container.innerHTML = ''
    
    // Create a simple graph visualization
    const graphContainer = document.createElement('div')
    graphContainer.style.position = 'relative'
    graphContainer.style.width = '100%'
    graphContainer.style.height = `${height}px`
    graphContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.5)'
    graphContainer.style.borderRadius = '8px'
    
    // Create nodes
    const nodeElements: {[key: string]: HTMLDivElement} = {}
    const nodePositions: {[key: string]: {x: number, y: number}} = {}
    
    // Calculate positions using a simple force-directed layout algorithm
    // For simplicity, we'll use a circular layout
    const centerX = graphContainer.clientWidth / 2 || 300
    const centerY = graphContainer.clientHeight / 2 || 200
    const radius = Math.min(centerX, centerY) * 0.8
    
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      nodePositions[node.id] = { x, y }
      
      const nodeElement = document.createElement('div')
      nodeElement.style.position = 'absolute'
      nodeElement.style.left = `${x}px`
      nodeElement.style.top = `${y}px`
      nodeElement.style.transform = 'translate(-50%, -50%)'
      nodeElement.style.width = `${Math.max(30, Math.min(60, node.value * 10))}px`
      nodeElement.style.height = `${Math.max(30, Math.min(60, node.value * 10))}px`
      nodeElement.style.borderRadius = '50%'
      nodeElement.style.display = 'flex'
      nodeElement.style.alignItems = 'center'
      nodeElement.style.justifyContent = 'center'
      nodeElement.style.fontSize = '12px'
      nodeElement.style.fontWeight = 'bold'
      nodeElement.style.color = 'white'
      nodeElement.style.cursor = 'pointer'
      nodeElement.style.transition = 'all 0.3s ease'
      nodeElement.style.zIndex = '2'
      nodeElement.title = node.label
      
      // Set color based on node type
      switch (node.type) {
        case 'person':
          nodeElement.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'
          break
        case 'project':
          nodeElement.style.backgroundColor = 'rgba(16, 185, 129, 0.8)'
          break
        case 'meeting':
          nodeElement.style.backgroundColor = 'rgba(245, 158, 11, 0.8)'
          break
        case 'concept':
          nodeElement.style.backgroundColor = 'rgba(139, 92, 246, 0.8)'
          break
        default:
          nodeElement.style.backgroundColor = 'rgba(156, 163, 175, 0.8)'
      }
      
      // Add label
      nodeElement.textContent = node.label.substring(0, 2)
      
      // Add hover effect
      nodeElement.addEventListener('mouseenter', () => {
        nodeElement.style.transform = 'translate(-50%, -50%) scale(1.2)'
        
        // Show tooltip
        const tooltip = document.createElement('div')
        tooltip.className = 'node-tooltip'
        tooltip.style.position = 'absolute'
        tooltip.style.left = `${x}px`
        tooltip.style.top = `${y + 30}px`
        tooltip.style.transform = 'translateX(-50%)'
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
        tooltip.style.color = 'white'
        tooltip.style.padding = '4px 8px'
        tooltip.style.borderRadius = '4px'
        tooltip.style.fontSize = '12px'
        tooltip.style.zIndex = '3'
        tooltip.style.pointerEvents = 'none'
        tooltip.textContent = node.label
        
        graphContainer.appendChild(tooltip)
        nodeElement.dataset.tooltipId = 'node-tooltip-' + node.id
      })
      
      nodeElement.addEventListener('mouseleave', () => {
        nodeElement.style.transform = 'translate(-50%, -50%)'
        
        // Remove tooltip
        const tooltips = graphContainer.querySelectorAll('.node-tooltip')
        tooltips.forEach(tooltip => tooltip.remove())
      })
      
      // Add click handler
      if (onNodeClick) {
        nodeElement.addEventListener('click', () => {
          onNodeClick(node.id)
        })
      }
      
      nodeElements[node.id] = nodeElement
      graphContainer.appendChild(nodeElement)
    })
    
    // Create edges
    edges.forEach(edge => {
      if (!nodePositions[edge.from] || !nodePositions[edge.to]) return
      
      const fromPos = nodePositions[edge.from]
      const toPos = nodePositions[edge.to]
      
      const edgeElement = document.createElement('div')
      edgeElement.style.position = 'absolute'
      edgeElement.style.left = `${fromPos.x}px`
      edgeElement.style.top = `${fromPos.y}px`
      edgeElement.style.width = '1px'
      edgeElement.style.height = '1px'
      edgeElement.style.zIndex = '1'
      
      // Calculate the angle and length of the edge
      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      
      // Create the line
      const line = document.createElement('div')
      line.style.position = 'absolute'
      line.style.width = `${length}px`
      line.style.height = '2px'
      line.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
      line.style.transformOrigin = '0 50%'
      line.style.transform = `rotate(${angle}deg)`
      
      // Add edge value (thickness)
      if (edge.value) {
        line.style.height = `${Math.max(1, Math.min(4, edge.value))}px`
        line.style.opacity = `${Math.min(1, edge.value / 5)}`
      }
      
      edgeElement.appendChild(line)
      graphContainer.appendChild(edgeElement)
    })
    
    container.appendChild(graphContainer)
    
    // Add legend
    const legend = document.createElement('div')
    legend.style.position = 'absolute'
    legend.style.bottom = '10px'
    legend.style.right = '10px'
    legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
    legend.style.padding = '8px'
    legend.style.borderRadius = '4px'
    legend.style.fontSize = '12px'
    
    const legendTypes = [
      { type: 'person', color: 'rgba(59, 130, 246, 0.8)', label: 'Person' },
      { type: 'project', color: 'rgba(16, 185, 129, 0.8)', label: 'Project' },
      { type: 'meeting', color: 'rgba(245, 158, 11, 0.8)', label: 'Meeting' },
      { type: 'concept', color: 'rgba(139, 92, 246, 0.8)', label: 'Concept' }
    ]
    
    legendTypes.forEach(item => {
      const legendItem = document.createElement('div')
      legendItem.style.display = 'flex'
      legendItem.style.alignItems = 'center'
      legendItem.style.marginBottom = '4px'
      
      const legendColor = document.createElement('div')
      legendColor.style.width = '12px'
      legendColor.style.height = '12px'
      legendColor.style.borderRadius = '50%'
      legendColor.style.backgroundColor = item.color
      legendColor.style.marginRight = '6px'
      
      const legendLabel = document.createElement('span')
      legendLabel.textContent = item.label
      legendLabel.style.color = 'white'
      
      legendItem.appendChild(legendColor)
      legendItem.appendChild(legendLabel)
      legend.appendChild(legendItem)
    })
    
    graphContainer.appendChild(legend)
    
    // Add stats
    const stats = document.createElement('div')
    stats.style.position = 'absolute'
    stats.style.top = '10px'
    stats.style.left = '10px'
    stats.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
    stats.style.padding = '8px'
    stats.style.borderRadius = '4px'
    stats.style.fontSize = '12px'
    stats.style.color = 'white'
    stats.textContent = `${nodes.length} nodes, ${edges.length} connections`
    
    graphContainer.appendChild(stats)
    
    return () => {
      // Cleanup
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = null
      }
    }
  }, [nodes, edges, height, onNodeClick])
  
  if (nodes.length === 0) {
    return (
      <div 
        ref={containerRef} 
        className="w-full" 
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-medium mb-2">No Knowledge Graph Data</h3>
            <p className="text-neutral-400">
              Start recording meetings to build your knowledge graph
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef} 
      className="w-full" 
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-medium mb-2">Loading Knowledge Graph...</h3>
          <p className="text-neutral-400">
            Visualizing your organization's knowledge connections
          </p>
        </div>
      </div>
    </div>
  )
}
