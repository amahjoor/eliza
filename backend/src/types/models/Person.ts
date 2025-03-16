import { Model, Optional } from 'sequelize';

// Person attributes interface
export interface PersonAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  organization?: string;
  role?: string;
  aiSummary?: string;
  networkConnectivity?: number; // 1-100 score of how connected this person is
  meetingHistory?: any[]; // Array of meeting attendance records
  contributions?: any[]; // Array of key contributions and insights
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Owner of this person record
}

// Person creation attributes interface (optional fields for creation)
export interface PersonCreationAttributes extends Optional<PersonAttributes, 'id' | 'createdAt' | 'updatedAt' | 'aiSummary' | 'networkConnectivity' | 'meetingHistory' | 'contributions'> {}

// Person instance interface
export interface PersonInstance extends Model<PersonAttributes, PersonCreationAttributes>, PersonAttributes {
  Meetings?: any[];
  Projects?: any[];
  User?: any;
}

// Meeting attendance record interface
export interface MeetingAttendanceRecord {
  meetingId: string;
  meetingTitle: string;
  date: Date;
  role?: string;
  contributions?: string[];
  actionItems?: string[];
}

// Contribution record interface
export interface ContributionRecord {
  content: string;
  meetingId?: string;
  date: Date;
  type: 'insight' | 'decision' | 'question' | 'action';
  tags?: string[];
}
