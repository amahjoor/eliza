'use client';

import React, { useEffect, useState, useRef } from 'react';
import { subscribeToTranscriptUpdates, joinMeeting, leaveMeeting, unsubscribeFromMeetingEvents } from '../lib/socket';

interface Segment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker: string;
}

interface LiveTranscriptProps {
  meetingId: string;
  initialSegments?: Segment[];
}

const LiveTranscript: React.FC<LiveTranscriptProps> = ({ meetingId, initialSegments = [] }) => {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Join meeting room
    joinMeeting(meetingId);
    setIsLive(true);

    // Subscribe to transcript updates
    subscribeToTranscriptUpdates(meetingId, (data) => {
      if (data.segments) {
        setSegments(data.segments);
      }
    });

    // Clean up on unmount
    return () => {
      leaveMeeting(meetingId);
      unsubscribeFromMeetingEvents(meetingId);
      setIsLive(false);
    };
  }, [meetingId]);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (autoScroll && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [segments, autoScroll]);

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (transcriptRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = transcriptRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Only update autoScroll if it would change
      if (autoScroll !== isAtBottom) {
        setAutoScroll(isAtBottom);
      }
    }
  };

  // Format timestamp (seconds to MM:SS)
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-4 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Live Transcript</h3>
        {isLive && (
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
            <span className="text-sm text-gray-400">Live</span>
          </div>
        )}
      </div>
      
      <div 
        ref={transcriptRef}
        className="max-h-96 overflow-y-auto pr-2 space-y-4"
        onScroll={handleScroll}
      >
        {segments.length > 0 ? (
          segments.map((segment) => (
            <div key={segment.id} className="flex">
              <div className="text-xs text-gray-400 w-12 pt-1 flex-shrink-0">
                {formatTimestamp(segment.start)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-primary mb-1">
                  {segment.speaker}
                </div>
                <div className="text-sm text-gray-200">
                  {segment.text}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            Waiting for transcript...
          </div>
        )}
      </div>
      
      {!autoScroll && segments.length > 0 && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (transcriptRef.current) {
              transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
            }
          }}
          className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary text-sm py-2 px-4 rounded-md transition-colors"
        >
          Scroll to Latest
        </button>
      )}
    </div>
  );
};

export default LiveTranscript;
