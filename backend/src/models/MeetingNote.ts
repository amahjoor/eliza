import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface MeetingNoteAttributes {
  id: string;
  meetingId: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'text';
  templateId?: string;
  createdBy: string;
  summary?: string;
  actionItems?: any[];
  followUps?: any[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingNoteCreationAttributes extends Optional<MeetingNoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface MeetingNoteInstance extends Model<MeetingNoteAttributes, MeetingNoteCreationAttributes>, MeetingNoteAttributes {}

export default (sequelize: Sequelize) => {
  const MeetingNote = sequelize.define<MeetingNoteInstance>(
    'MeetingNote',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      meetingId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      format: {
        type: DataTypes.ENUM('markdown', 'html', 'text'),
        defaultValue: 'markdown',
        allowNull: false
      },
      templateId: {
        type: DataTypes.UUID
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT
      },
      actionItems: {
        type: DataTypes.JSONB
      },
      followUps: {
        type: DataTypes.JSONB
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      }
    },
    {
      timestamps: true
    }
  );

  MeetingNote.associate = (models: any) => {
    MeetingNote.belongsTo(models.Meeting, { foreignKey: 'meetingId' });
    MeetingNote.belongsTo(models.Template, { foreignKey: 'templateId' });
    MeetingNote.belongsTo(models.User, { foreignKey: 'createdBy' });
  };

  return MeetingNote;
};
