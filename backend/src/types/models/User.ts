import { Model, Optional } from 'sequelize';

// User attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  settings?: {
    ai?: {
      noteDetailLevel?: number;
      defaultTemplateId?: string;
      preferredModel?: string;
    };
    notifications?: {
      email?: boolean;
      browser?: boolean;
      mobile?: boolean;
    };
    integrations?: {
      zoom?: boolean;
      teams?: boolean;
      meet?: boolean;
      slack?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// User creation attributes interface (optional fields for creation)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'settings'> {}

// User instance interface
export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  Meetings?: any[];
  MeetingNotes?: any[];
  Templates?: any[];
}
