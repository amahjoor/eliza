import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface MeetingAttributes {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  projectId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingCreationAttributes extends Optional<MeetingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface MeetingInstance extends Model<MeetingAttributes, MeetingCreationAttributes>, MeetingAttributes {
  Transcripts?: any[];
  MeetingNotes?: any[];
  Attendees?: any[];
}

export default (sequelize: Sequelize) => {
  const Meeting = sequelize.define<MeetingInstance>(
    'Meeting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endTime: {
        type: DataTypes.DATE
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled',
        allowNull: false
      },
      projectId: {
        type: DataTypes.UUID
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      timestamps: true
    }
  );

  Meeting.associate = (models: any) => {
    Meeting.belongsTo(models.Project, { foreignKey: 'projectId' });
    Meeting.belongsTo(models.User, { foreignKey: 'createdBy' });
    Meeting.hasMany(models.Transcript, { foreignKey: 'meetingId' });
    Meeting.hasMany(models.MeetingNote, { foreignKey: 'meetingId' });
    Meeting.belongsToMany(models.Person, {
      through: 'MeetingAttendees',
      foreignKey: 'meetingId',
      as: 'Attendees'
    });
  };

  return Meeting;
};
