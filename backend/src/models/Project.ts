import { DataTypes, Model, Sequelize } from 'sequelize';
import { ProjectAttributes, ProjectCreationAttributes, ProjectInstance } from '../types/models/Project';

export default (sequelize: Sequelize) => {
  const Project = sequelize.define<ProjectInstance>(
    'Project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('planning', 'active', 'completed', 'on_hold'),
        allowNull: false,
        defaultValue: 'planning',
      },
      progressScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      statusSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      keyRisks: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      nextSteps: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      tags: {
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
      tableName: 'Projects',
      timestamps: true,
    }
  );

  // Define associations
  const associate = (models: any) => {
    Project.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    Project.hasMany(models.Meeting, {
      foreignKey: 'projectId',
      as: 'meetings',
    });
    
    Project.belongsToMany(models.Person, {
      through: 'ProjectMembers',
      foreignKey: 'projectId',
      otherKey: 'personId',
      as: 'members',
    });
  };

  // Add associate method to the model
  (Project as any).associate = associate;

  return Project;
};
