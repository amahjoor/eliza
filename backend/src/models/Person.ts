import { DataTypes, Model, Sequelize } from 'sequelize';
import { PersonAttributes, PersonCreationAttributes, PersonInstance } from '../types/models/Person';

export default (sequelize: Sequelize) => {
  const Person = sequelize.define<PersonInstance>(
    'Person',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aiSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      networkConnectivity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 100,
        },
      },
      meetingHistory: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      contributions: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
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
      tableName: 'People',
      timestamps: true,
    }
  );

  // Define associations
  const associate = (models: any) => {
    Person.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    Person.belongsToMany(models.Meeting, {
      through: 'MeetingAttendees',
      foreignKey: 'personId',
      otherKey: 'meetingId',
      as: 'meetings',
    });
    
    Person.belongsToMany(models.Project, {
      through: 'ProjectMembers',
      foreignKey: 'personId',
      otherKey: 'projectId',
      as: 'projects',
    });
  };

  // Add associate method to the model
  (Person as any).associate = associate;

  return Person;
};
