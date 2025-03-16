import { Model, Optional } from 'sequelize';

// Project attributes interface
export interface ProjectAttributes {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progressScore?: number; // 0-100 score of project completion
  statusSummary?: string;
  keyRisks?: string[];
  nextSteps?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Owner of this project record
}

// Project creation attributes interface (optional fields for creation)
export interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'progressScore' | 'statusSummary' | 'keyRisks' | 'nextSteps'> {}

// Project instance interface
export interface ProjectInstance extends Model<ProjectAttributes, ProjectCreationAttributes>, ProjectAttributes {
  Meetings?: any[];
  People?: any[];
  User?: any;
}

// Project member interface
export interface ProjectMember {
  personId: string;
  role: string;
  joinDate: Date;
  contributions?: string[];
}
