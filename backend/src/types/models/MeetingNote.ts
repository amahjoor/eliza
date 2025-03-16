import { Model, Optional } from 'sequelize';

// MeetingNote attributes interface
export interface MeetingNoteAttributes {
  id: string;
  meetingId: string;
  userId: string;
  content: string;
  format: 'markdown' | 'html';
  summary?: string;
  outline?: any; // JSON structure of the note outline
  actionItems?: any[]; // Array of action items with assignees and deadlines
  aiGenerated: boolean;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// MeetingNote creation attributes interface (optional fields for creation)
export interface MeetingNoteCreationAttributes extends Optional<MeetingNoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// MeetingNote instance interface
export interface MeetingNoteInstance extends Model<MeetingNoteAttributes, MeetingNoteCreationAttributes>, MeetingNoteAttributes {
  Meeting?: any;
  User?: any;
  Template?: any;
}

// Action item interface
export interface ActionItem {
  task: string;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date | null;
  completedAt?: Date | null;
}

// Outline item interface
export interface OutlineItem {
  title: string;
  items: (string | OutlineItem)[];
}
