import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Meeting extends Model {
  public id!: number
  public name!: string
  public startTime!: Date
  public endTime!: Date | null
  public duration!: number | null
  public recordingType!: 'zoom' | 'teams' | 'meet' | 'physical' | 'upload'
  public recordingUrl!: string | null
  public status!: 'recording' | 'processing' | 'completed' | 'failed'
  public userId!: number
  public projectId!: number | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Meeting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds
      allowNull: true
    },
    recordingType: {
      type: DataTypes.ENUM('zoom', 'teams', 'meet', 'physical', 'upload'),
      allowNull: false
    },
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('recording', 'processing', 'completed', 'failed'),
      defaultValue: 'recording'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Meeting',
    hooks: {
      beforeCreate: (meeting: Meeting) => {
        // Set default name if not provided
        if (!meeting.name) {
          meeting.name = `Meeting on ${new Date(meeting.startTime).toLocaleDateString()}`
        }
      },
      beforeUpdate: (meeting: Meeting) => {
        // Calculate duration if start and end times are available
        if (meeting.endTime && meeting.startTime) {
          const durationMs = new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()
          meeting.duration = Math.floor(durationMs / 1000) // Convert to seconds
        }
      }
    }
  }
)

export default Meeting
