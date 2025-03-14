'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// Mock data for projects
const getProjectsData = () => {
  return [
    {
      id: '1',
      name: 'Product Redesign',
      description: 'Comprehensive redesign of our core product UI/UX for improved user experience and conversion.',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-12-15'),
      status: 'in-progress',
      meetingsCount: 12,
      lastMeeting: new Date('2023-11-15T14:30:00'),
      members: [
        { id: '1', name: 'Alex Johnson', role: 'Project Lead' },
        { id: '2', name: 'Sarah Chen', role: 'Technical Lead' },
        { id: '3', name: 'Miguel Rodriguez', role: 'UX Designer' }
      ],
      tags: ['Design', 'Product', 'Q4']
    },
    {
      id: '2',
      name: 'Backend Optimization',
      description: 'Performance improvements and scalability enhancements for our backend infrastructure.',
      startDate: new Date('2023-09-15'),
      endDate: new Date('2023-11-30'),
      status: 'in-progress',
      meetingsCount: 8,
      lastMeeting: new Date('2023-11-14T10:00:00'),
      members: [
        { id: '2', name: 'Sarah Chen', role: 'Technical Lead' },
        { id: '5', name: 'David Park', role: 'Backend Developer' },
        { id: '6', name: 'Emma Wilson', role: 'DevOps Engineer' }
      ],
      tags: ['Engineering', 'Performance', 'Infrastructure']
    },
    {
      id: '3',
      name: 'Q4 Marketing Campaign',
      description: 'End-of-year marketing campaign to drive user acquisition and retention.',
      startDate: new Date('2023-10-15'),
      endDate: new Date('2023-12-31'),
      status: 'in-progress',
      meetingsCount: 6,
      lastMeeting: new Date('2023-11-13T15:00:00'),
      members: [
        { id: '4', name: 'Taylor Kim', role: 'Campaign Lead' },
        { id: '7', name: 'James Lee', role: 'Content Strategist' },
        { id: '8', name: 'Olivia Martinez', role: 'Social Media Manager' }
      ],
      tags: ['Marketing', 'Campaign', 'Q4']
    }
  ];
};

const ProjectCard = ({ project }: { project: any }) => {
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
        <div>
          <h3 className="text-xl font-bold">{project.name}</h3>
          <div className="flex items-center mt-1">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              project.status === 'completed' ? 'bg-green-500' : 
              project.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
            }`}></span>
            <span className="text-gray-400 text-sm capitalize">{project.status.replace('-', ' ')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-400">{project.meetingsCount} meetings</div>
          <div className="text-sm text-gray-400">Last: {formatDate(project.lastMeeting)}</div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{project.description}</p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          {formatDate(project.startDate)} - {formatDate(project.endDate)}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Team Members</div>
        <div className="flex flex-wrap">
          {project.members.map((member: any) => (
            <div 
              key={member.id} 
              className="mr-2 mb-2 px-3 py-1 bg-primary/20 rounded-full text-white text-xs"
            >
              {member.name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap">
          {project.tags.map((tag: string, index: number) => (
            <div 
              key={index} 
              className="mr-2 mb-2 px-3 py-1 bg-gray-700/50 rounded-full text-white text-xs"
            >
              {tag}
            </div>
          ))}
        </div>
        
        <Link href={`/projects/${project.id}`} className="glass-button text-sm">
          View Project
        </Link>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch projects from an API
    // For now, we'll use our mock data function
    const data = getProjectsData();
    setProjects(data);
  }, []);
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === '' || 
      project.tags.some((tag: string) => tag.toLowerCase() === filterTag.toLowerCase());
    
    const matchesStatus = filterStatus === '' || project.status === filterStatus;
    
    return matchesSearch && matchesTag && matchesStatus;
  });
  
  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button className="primary-button">
            New Project
          </button>
        </div>
        
        <div className="glass-panel p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No projects found. Try adjusting your filters or create a new project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
