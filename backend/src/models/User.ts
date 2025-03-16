import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import bcrypt from 'bcrypt'

class User extends Model {
  public id!: number
  public email!: string
  public password!: string
  public firstName!: string
  public lastName!: string
  public role!: 'user' | 'admin'
  public settings!: any
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Method to check password
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: 'dark',
        autoBackupInterval: 300, // 5 minutes in seconds
        defaultMeetingTemplate: null,
        aiGeneratedContent: true,
        showAiContentToggle: true,
        audioProcessingPreferences: {
          enableSpeakerDiarization: true,
          enableBackgroundNoiseReduction: true
        },
        notificationPreferences: {
          email: true,
          browser: true
        }
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10)
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      }
    }
  }
)

export default User
