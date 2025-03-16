import { Model, Optional } from 'sequelize';

// Template attributes interface
export interface TemplateAttributes {
  id: string;
  name: string;
  description?: string;
  type: 'meeting_note' | 'person_insight' | 'project_summary' | 'knowledge_entry';
  content: string;
  systemPrompt?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Template creation attributes interface (optional fields for creation)
export interface TemplateCreationAttributes extends Optional<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Template instance interface
export interface TemplateInstance extends Model<TemplateAttributes, TemplateCreationAttributes>, TemplateAttributes {
  User?: any;
}
