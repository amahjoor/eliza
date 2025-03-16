import { DataTypes, Model, Sequelize } from 'sequelize';
import { 
  KnowledgeEntryAttributes, 
  KnowledgeEntryCreationAttributes, 
  KnowledgeEntryInstance,
  KnowledgeConnectionAttributes,
  KnowledgeConnectionCreationAttributes,
  KnowledgeConnectionInstance
} from '../types/models/KnowledgeEntry';

export default (sequelize: Sequelize) => {
  // Define KnowledgeEntry model
  const KnowledgeEntry = sequelize.define<KnowledgeEntryInstance>(
    'KnowledgeEntry',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('concept', 'decision', 'technical', 'milestone', 'relationship'),
        allowNull: false,
        defaultValue: 'concept',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      relevance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        validate: {
          min: 1,
          max: 100,
        },
      },
      meetingId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Meetings',
          key: 'id',
        },
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
      tableName: 'KnowledgeEntries',
      timestamps: true,
    }
  );

  // Define KnowledgeConnection model
  const KnowledgeConnection = sequelize.define<KnowledgeConnectionInstance>(
    'KnowledgeConnection',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sourceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'KnowledgeEntries',
          key: 'id',
        },
      },
      targetId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'KnowledgeEntries',
          key: 'id',
        },
      },
      strength: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
        validate: {
          min: 0.1,
          max: 1.0,
        },
      },
      type: {
        type: DataTypes.ENUM('related', 'depends_on', 'contradicts', 'supports', 'references'),
        allowNull: false,
        defaultValue: 'related',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'KnowledgeConnections',
      timestamps: true,
    }
  );

  // Define associations for KnowledgeEntry
  const associateKnowledgeEntry = (models: any) => {
    KnowledgeEntry.belongsTo(models.Meeting, {
      foreignKey: 'meetingId',
      as: 'meeting',
    });
    
    KnowledgeEntry.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    KnowledgeEntry.hasMany(KnowledgeConnection, {
      foreignKey: 'sourceId',
      as: 'outgoingConnections',
    });
    
    KnowledgeEntry.hasMany(KnowledgeConnection, {
      foreignKey: 'targetId',
      as: 'incomingConnections',
    });
  };

  // Define associations for KnowledgeConnection
  const associateKnowledgeConnection = (models: any) => {
    KnowledgeConnection.belongsTo(KnowledgeEntry, {
      foreignKey: 'sourceId',
      as: 'source',
    });
    
    KnowledgeConnection.belongsTo(KnowledgeEntry, {
      foreignKey: 'targetId',
      as: 'target',
    });
  };

  // Add associate methods to the models
  (KnowledgeEntry as any).associate = associateKnowledgeEntry;
  (KnowledgeConnection as any).associate = associateKnowledgeConnection;

  return { KnowledgeEntry, KnowledgeConnection };
};
