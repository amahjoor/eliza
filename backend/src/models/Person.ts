import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Person extends Model {
  public id!: number
  public firstName!: string
  public lastName!: string
  public email!: string | null
  public organization!: string | null
  public role!: string | null
  public meetingHistory!: any // JSONB
  public contributions!: any // JSONB
  public aiSummary!: string | null
  public networkConnectivity!: 'low' | 'medium' | 'high'
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Person.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingHistory: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     meetingId: number,
      //     meetingName: string,
      //     date: string,
      //     speakingTime: number, // seconds
      //     topics: string[]
      //   }
      // ]
    },
    contributions: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Structure:
      // [
      //   {
      //     meetingId: number,
      //     meetingName: string,
      //     date: string,
      //     insights: string[],
      //     decisions: string[]
      //   }
      // ]
    },
    aiSummary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    networkConnectivity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    }
  },
  {
    sequelize,
    modelName: 'Person',
    hooks: {
      beforeCreate: (person: Person) => {
        // Set default values if needed
      }
    }
  }
)

export default Person
