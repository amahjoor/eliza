import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface TranscriptAttributes {
  id: string;
  meetingId: string;
  content: string;
  segments?: any[];
  audioFileUrl?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptCreationAttributes extends Optional<TranscriptAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface TranscriptInstance extends Model<TranscriptAttributes, TranscriptCreationAttributes>, TranscriptAttributes {}

export default (sequelize: Sequelize) => {
  const Transcript = sequelize.define<TranscriptInstance>(
    'Transcript',
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      segments: {
        type: DataTypes.JSONB
      },
      audioFileUrl: {
        type: DataTypes.STRING
      },
      processingStatus: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      }
    },
    {
      timestamps: true
    }
  );

  Transcript.associate = (models: any) => {
    Transcript.belongsTo(models.Meeting, { foreignKey: 'meetingId' });
  };

  return Transcript;
};
