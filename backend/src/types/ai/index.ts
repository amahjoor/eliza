// AI Service Types

// Note Generation Types
export interface NoteGenerationOptions {
  detailLevel?: number; // 1-3, where 1 is concise, 3 is detailed
  format?: 'markdown' | 'html' | 'text';
  includeActionItems?: boolean;
  includeFollowUps?: boolean;
  includeSummary?: boolean;
  customSections?: string[];
  templateId?: string;
  style?: 'formal' | 'casual' | 'technical';
  focusAreas?: string[];
  excludeTopics?: string[];
  maxLength?: number;
}

export interface GeneratedNote {
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'text';
  summary?: string;
  actionItems?: ActionItem[];
  followUps?: FollowUp[];
  sections?: NoteSection[];
  metadata: {
    generatedAt: Date;
    meetingId: string;
    templateId?: string;
    options: NoteGenerationOptions;
  };
}

export interface ActionItem {
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface FollowUp {
  description: string;
  assignee?: string;
  dueDate?: Date;
}

export interface NoteSection {
  title: string;
  content: string;
}

// Insight Generation Types
export interface InsightGenerationOptions {
  depth?: 'concise' | 'detailed' | 'comprehensive';
  timeframe?: {
    startDate?: Date;
    endDate?: Date;
  };
  focusAreas?: string[];
}

export interface PersonInsight {
  personId: string;
  insights: Insight[];
  metadata: {
    generatedAt: Date;
    options: InsightGenerationOptions;
  };
}

export interface ProjectInsight {
  projectId: string;
  insights: Insight[];
  metadata: {
    generatedAt: Date;
    options: InsightGenerationOptions;
  };
}

export interface MeetingInsight {
  meetingId: string;
  insights: Insight[];
  metadata: {
    generatedAt: Date;
    options: InsightGenerationOptions;
  };
}

export interface Insight {
  type: 'observation' | 'trend' | 'recommendation' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-100
  evidence: string[];
  tags?: string[];
  relatedEntities?: {
    type: 'person' | 'project' | 'meeting';
    id: string;
    name: string;
  }[];
}

// Knowledge Base Types
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'fact' | 'process' | 'decision';
  tags: string[];
  sourceType: 'meeting' | 'note' | 'manual';
  sourceId: string;
  relevance: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface KnowledgeConnection {
  source: string; // KnowledgeEntry ID
  target: string; // KnowledgeEntry ID
  type: string; // e.g., 'related', 'depends_on', 'contradicts'
  strength: number; // 0-100
  description: string;
}

// AI Model Configuration
export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  customEndpoint?: string;
}

// AI Service Configuration
export interface AIServiceConfig {
  noteGeneration: {
    model: AIModelConfig;
    defaultOptions: NoteGenerationOptions;
  };
  insightGeneration: {
    model: AIModelConfig;
    defaultOptions: InsightGenerationOptions;
  };
  knowledgeBase: {
    model: AIModelConfig;
    minRelevanceScore: number;
    maxEntriesPerSource: number;
  };
}
