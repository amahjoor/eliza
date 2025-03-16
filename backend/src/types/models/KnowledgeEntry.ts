import { Model, Optional } from 'sequelize';

// KnowledgeEntry attributes interface
export interface KnowledgeEntryAttributes {
  id: string;
  title: string;
  type: 'concept' | 'decision' | 'technical' | 'milestone' | 'relationship';
  description: string;
  tags: string[];
  source: string;
  relevance: number; // 1-100 score of relevance
  meetingId?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// KnowledgeEntry creation attributes interface (optional fields for creation)
export interface KnowledgeEntryCreationAttributes extends Optional<KnowledgeEntryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// KnowledgeEntry instance interface
export interface KnowledgeEntryInstance extends Model<KnowledgeEntryAttributes, KnowledgeEntryCreationAttributes>, KnowledgeEntryAttributes {
  Meeting?: any;
  User?: any;
  Connections?: KnowledgeConnectionInstance[];
}

// KnowledgeConnection attributes interface
export interface KnowledgeConnectionAttributes {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 0.1-1.0 score of connection strength
  type: 'related' | 'depends_on' | 'contradicts' | 'supports' | 'references';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// KnowledgeConnection creation attributes interface (optional fields for creation)
export interface KnowledgeConnectionCreationAttributes extends Optional<KnowledgeConnectionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// KnowledgeConnection instance interface
export interface KnowledgeConnectionInstance extends Model<KnowledgeConnectionAttributes, KnowledgeConnectionCreationAttributes>, KnowledgeConnectionAttributes {
  Source?: KnowledgeEntryInstance;
  Target?: KnowledgeEntryInstance;
}
