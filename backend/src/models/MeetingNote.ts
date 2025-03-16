import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class MeetingNote extends Model {
  public id!: number
  public meetingId!: number
  public summary!: string
  public outline!: any // JSONB
  public actionItems!: any // JSONB
  public content!: string
  public format!: 'markdown' | 'html'
  public aiGenerated!: boolean
  public templateId!: number | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

MeetingNote.init(
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
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    outline: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    actionItems: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     id: string,
      //     task: string,
      //     assignee: string | null,
      //     dueDate: string | null,
      //     status: 'todo' | 'in-progress' | 'completed',
      //     priority: 'low' | 'medium' | 'high'
      //   }
      // ]
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    format: {
      type: DataTypes.ENUM('markdown', 'html'),
      defaultValue: 'markdown'
    },
    aiGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'MeetingNote'
  }
)

export default MeetingNote
