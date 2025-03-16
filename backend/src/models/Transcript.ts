import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Transcript extends Model {
  public id!: number
  public meetingId!: number
  public content!: any // JSONB
  public processingStatus!: 'pending' | 'diarizing' | 'transcribing' | 'completed' | 'failed'
  public errorMessage!: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Transcript.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Structure:
      // [
      //   {
      //     speakerId: string,
      //     speakerName: string,
      //     startTime: number, // seconds from start
      //     endTime: number, // seconds from start
      //     text: string
      //   }
      // ]
    },
    processingStatus: {
      type: DataTypes.ENUM('pending', 'diarizing', 'transcribing', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Transcript'
  }
)

export default Transcript
