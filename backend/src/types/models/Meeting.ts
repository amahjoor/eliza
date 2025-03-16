import { Model, Optional } from 'sequelize';

// Meeting attributes interface
export interface MeetingAttributes {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  recordingType: 'zoom' | 'teams' | 'meet' | 'physical' | 'upload';
  recordingUrl?: string;
  location?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Meeting creation attributes interface (optional fields for creation)
export interface MeetingCreationAttributes extends Optional<MeetingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Meeting instance interface
export interface MeetingInstance extends Model<MeetingAttributes, MeetingCreationAttributes>, MeetingAttributes {
  Transcripts?: any[];
  MeetingNotes?: any[];
  Attendees?: any[];
}
