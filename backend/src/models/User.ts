import { DataTypes, Model, Sequelize } from 'sequelize';
import { UserAttributes, UserCreationAttributes, UserInstance } from '../types/models/User';

export default (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          ai: {
            noteDetailLevel: 3,
            preferredModel: 'gpt-4-turbo',
          },
          notifications: {
            email: true,
            browser: true,
            mobile: false,
          },
          integrations: {
            zoom: false,
            teams: false,
            meet: false,
            slack: false,
          },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  // Define associations
  const associate = (models: any) => {
    User.hasMany(models.Meeting, {
      foreignKey: 'userId',
      as: 'meetings',
    });
    
    User.hasMany(models.MeetingNote, {
      foreignKey: 'userId',
      as: 'meetingNotes',
    });
    
    User.hasMany(models.Template, {
      foreignKey: 'userId',
      as: 'templates',
    });
    
    User.hasMany(models.Person, {
      foreignKey: 'userId',
      as: 'people',
    });
    
    User.hasMany(models.Project, {
      foreignKey: 'userId',
      as: 'projects',
    });
  };

  // Add associate method to the model
  (User as any).associate = associate;

  return User;
};
