// Knowledge Base Types
export interface KnowledgeEntry {
  id?: string;
  title: string;
  type: string;
  description: string;
  tags: string[];
  source: string;
  relevance: number;
  meetingId: string;
  createdAt: string;
}

export interface KnowledgeConnection {
  source: string;
  target: string;
  strength: number;
  type: string;
  description: string;
  createdAt: string;
}

// Insight Types
export interface PersonInsight {
  personId: string;
  personName: string;
  summary: string;
  networkConnectivity: number;
  expertiseAreas: string[];
  generatedAt: string;
  aiGenerated: boolean;
}

export interface ProjectInsight {
  projectId: string;
  projectName: string;
  statusSummary: string;
  progressScore: number;
  keyRisks: string[];
  nextSteps: string[];
  generatedAt: string;
  aiGenerated: boolean;
}

export interface MeetingInsight {
  meetingId: string;
  meetingTitle: string;
  assessment: string;
  effectivenessScore: number;
  keyMoments: string[];
  improvements: string[];
  generatedAt: string;
  aiGenerated: boolean;
}

// Note Generation Types
export interface NoteGenerationOptions {
  format?: 'markdown' | 'html';
  style?: 'concise' | 'detailed' | 'technical' | 'executive';
  focusAreas?: string[];
  excludeTopics?: string[];
  maxLength?: number;
}
