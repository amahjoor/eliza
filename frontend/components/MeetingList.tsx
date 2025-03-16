'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  status: string;
  createdAt: string;
}

const MeetingList: React.FC = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/meetings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }

        const data = await response.json();
        setMeetings(data);
        setFilteredMeetings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...meetings];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(meeting => meeting.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        meeting =>
          meeting.title.toLowerCase().includes(term) ||
          meeting.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredMeetings(result);
  }, [meetings, statusFilter, searchTerm, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-400">Loading meetings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-xl">
        <p>Error loading meetings: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500/30 hover:bg-red-500/40 text-red-300 px-4 py-2 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background-light border border-white/10 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background-light border border-white/10 rounded-md py-2 px-4 flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              Filter
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-background-light border border-white/10 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <p className="text-sm text-gray-400 mb-2">Status</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        statusFilter === 'all'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('scheduled');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        statusFilter === 'scheduled'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      Scheduled
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('in_progress');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        statusFilter === 'in_progress'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('completed');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        statusFilter === 'completed'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background-light border border-white/10 rounded-md py-2 px-4 flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
                />
              </svg>
              Sort
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-background-light border border-white/10 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <p className="text-sm text-gray-400 mb-2">Sort by</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSortOrder('newest');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        sortOrder === 'newest'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder('oldest');
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        sortOrder === 'oldest'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => router.push('/meetings/new')}
            className="bg-primary hover:bg-primary/90 text-white rounded-md py-2 px-4 flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Meeting
          </button>
        </div>
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <Link
              href={`/meetings/${meeting.id}`}
              key={meeting.id}
              data-testid="meeting-item"
              className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold line-clamp-1">{meeting.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(
                    meeting.status
                  )}`}
                >
                  {meeting.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {meeting.description || 'No description provided'}
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatDate(meeting.startTime)}</span>
                <span className="mx-2">•</span>
                <span>{formatTime(meeting.startTime)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-xl text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-medium mb-2">No meetings found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first meeting'}
          </p>
          <button
            onClick={() => router.push('/meetings/new')}
            className="bg-primary hover:bg-primary/90 text-white rounded-md py-2 px-6 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingList;
