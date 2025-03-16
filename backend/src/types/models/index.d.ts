/**
 * Type definitions for models
 */

declare module 'models' {
  export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    settings?: {
      ai?: {
        noteDetailLevel: number;
        preferredModel: string;
        defaultTemplateId: string | null;
      };
      notifications?: {
        email: boolean;
        browser: boolean;
        actionItems: boolean;
      };
    };
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Meeting {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    participants: string[];
    projectId?: string;
    recordingUrl?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Transcript {
    id: string;
    meetingId: string;
    content: string;
    segments: Array<{
      speakerId: string;
      speakerName?: string;
      text: string;
      startTime: number;
      endTime: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface MeetingNote {
    id: string;
    meetingId: string;
    title: string;
    content: string;
    summary?: string;
    actionItems?: Array<{
      description: string;
      assignee?: string;
      dueDate?: Date;
      status: 'pending' | 'in-progress' | 'completed';
    }>;
    followUps?: Array<{
      description: string;
      participants: string[];
    }>;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Template {
    id: string;
    name: string;
    description: string;
    type: 'meeting_note' | 'summary' | 'action_items';
    content: string;
    createdBy: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Person {
    id: string;
    name: string;
    email?: string;
    role?: string;
    organization?: string;
    projects?: string[];
    tags: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'on-hold' | 'cancelled';
    members: string[];
    tags: string[];
    startDate?: Date;
    endDate?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    type: 'concept' | 'fact' | 'process' | 'decision';
    tags: string[];
    sourceType: 'meeting' | 'note' | 'manual';
    sourceId: string;
    relevance: number;
    createdAt: Date;
    updatedAt: Date;
  }
}
