'use client';

import React, { useEffect, useState } from 'react';
import { subscribeToStatusUpdates, joinMeeting, leaveMeeting, unsubscribeFromMeetingEvents } from '../lib/socket';

interface LiveMeetingStatusProps {
  meetingId: string;
  initialStatus?: string;
}

const LiveMeetingStatus: React.FC<LiveMeetingStatusProps> = ({ 
  meetingId, 
  initialStatus = 'idle' 
}) => {
  const [status, setStatus] = useState<string>(initialStatus);
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Join meeting room
    joinMeeting(meetingId);

    // Subscribe to status updates
    subscribeToStatusUpdates(meetingId, (data) => {
      if (data.status) {
        setStatus(data.status);
      }
      
      if (data.message) {
        setMessage(data.message);
      }
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
    });

    // Clean up on unmount
    return () => {
      leaveMeeting(meetingId);
      unsubscribeFromMeetingEvents(meetingId);
    };
  }, [meetingId]);

  // Get status display information
  const getStatusInfo = () => {
    switch (status) {
      case 'recording':
        return {
          label: 'Recording',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="6" />
            </svg>
          )
        };
      case 'processing':
        return {
          label: 'Processing',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          icon: (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )
        };
      case 'processing_transcript':
        return {
          label: 'Transcribing',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          icon: (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )
        };
      case 'processing_summary':
        return {
          label: 'Generating Summary',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/20',
          icon: (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          label: 'Error',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          label: 'Idle',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${statusInfo.bgColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-center">
        <div className={`${statusInfo.color} mr-3`}>
          {statusInfo.icon}
        </div>
        <div>
          <h4 className="font-medium">{statusInfo.label}</h4>
          {message && <p className="text-sm text-gray-400">{message}</p>}
        </div>
      </div>
      
      {progress > 0 && progress < 100 && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  );
};

export default LiveMeetingStatus;
