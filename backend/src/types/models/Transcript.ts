import { Model, Optional } from 'sequelize';

// Transcript processing status types
export type ProcessingStatus = 'pending' | 'diarizing' | 'transcribing' | 'completed' | 'failed';

// Transcript attributes interface
export interface TranscriptAttributes {
  id: string;
  meetingId: string;
  content: string;
  processingStatus: ProcessingStatus;
  audioUrl?: string;
  duration?: number; // in seconds
  speakerMap?: Record<string, string>; // Maps speaker IDs to names
  createdAt: Date;
  updatedAt: Date;
}

// Transcript creation attributes interface (optional fields for creation)
export interface TranscriptCreationAttributes extends Optional<TranscriptAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Transcript instance interface
export interface TranscriptInstance extends Model<TranscriptAttributes, TranscriptCreationAttributes>, TranscriptAttributes {
  Meeting?: any;
}
