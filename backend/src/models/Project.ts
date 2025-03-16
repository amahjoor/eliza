import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Project extends Model {
  public id!: number
  public name!: string
  public description!: string | null
  public startDate!: Date | null
  public endDate!: Date | null
  public status!: 'planning' | 'active' | 'completed' | 'on-hold'
  public knowledgeBase!: any // JSONB
  public timeline!: any // JSONB
  public goals!: any // JSONB
  public tasks!: any // JSONB
  public userId!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Project.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'on-hold'),
      defaultValue: 'planning'
    },
    knowledgeBase: {
      type: DataTypes.JSONB,
      defaultValue: {}
      // Structure:
      // {
      //   sections: [
      //     {
      //       id: string,
      //       title: string,
      //       content: string,
      //       aiGenerated: boolean,
      //       lastUpdated: string,
      //       sourceReferences: [
      //         {
      //           meetingId: number,
      //           timestamp: number // seconds from start
      //         }
      //       ]
      //     }
      //   ],
      //   miscellaneous: [
      //     {
      //       id: string,
      //       title: string,
      //       content: string,
      //       aiGenerated: boolean,
      //       lastUpdated: string
      //     }
      //   ]
      // }
    },
    timeline: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     id: string,
      //     date: string,
      //     title: string,
      //     description: string,
      //     type: 'milestone' | 'update' | 'decision',
      //     meetingReference: number | null // meetingId
      //   }
      // ]
    },
    goals: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     id: string,
      //     title: string,
      //     description: string,
      //     status: 'not-started' | 'in-progress' | 'completed',
      //     dueDate: string | null,
      //     priority: 'low' | 'medium' | 'high'
      //   }
      // ]
    },
    tasks: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     id: string,
      //     title: string,
      //     description: string,
      //     status: 'to-do' | 'in-progress' | 'completed' | 'blocked',
      //     assigneeId: number | null,
      //     dueDate: string | null,
      //     estimatedTime: number | null, // minutes
      //     priority: 'low' | 'medium' | 'high',
      //     tags: string[],
      //     dependencies: string[] // task ids
      //   }
      // ]
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Project'
  }
)

export default Project
