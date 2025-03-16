/**
 * Type definitions for AI services
 */

declare module 'ai' {
  // Note Generation Types
  export interface NoteGenerationOptions {
    detailLevel: number;
    format: 'markdown' | 'html' | 'text';
    includeActionItems: boolean;
    includeFollowUps: boolean;
    includeSummary: boolean;
    customSections?: string[];
    templateId?: string;
  }

  export interface GeneratedNote {
    title: string;
    content: string;
    summary?: string;
    actionItems?: Array<{
      description: string;
      assignee?: string;
      dueDate?: Date;
    }>;
    followUps?: Array<{
      description: string;
      participants: string[];
    }>;
    metadata: {
      generatedAt: Date;
      modelUsed: string;
      promptTokens: number;
      completionTokens: number;
    };
  }

  // Knowledge Base Types
  export interface KnowledgeExtraction {
    extractFromTranscript(
      transcriptId: string, 
      options?: {
        minRelevance?: number;
        maxEntries?: number;
      }
    ): Promise<KnowledgeEntry[]>;
    
    extractFromNote(
      noteId: string,
      options?: {
        minRelevance?: number;
        maxEntries?: number;
      }
    ): Promise<KnowledgeEntry[]>;
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

  export interface KnowledgeGraph {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      relevance: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string;
      strength: number;
      description?: string;
    }>;
  }

  // Insight Generation Types
  export interface InsightGenerationOptions {
    depth: 'basic' | 'detailed' | 'comprehensive';
    timeframe?: {
      start: Date;
      end: Date;
    };
    focusAreas?: Array<'people' | 'projects' | 'topics' | 'decisions' | 'trends'>;
  }

  export interface GeneratedInsight {
    id: string;
    title: string;
    description: string;
    type: 'trend' | 'connection' | 'recommendation' | 'risk' | 'opportunity';
    confidence: number;
    relatedEntities: Array<{
      id: string;
      type: 'person' | 'project' | 'meeting' | 'topic';
      name: string;
    }>;
    supportingEvidence: Array<{
      sourceType: 'meeting' | 'note' | 'knowledge';
      sourceId: string;
      excerpt: string;
    }>;
    createdAt: Date;
  }
}
