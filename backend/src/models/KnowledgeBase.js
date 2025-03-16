const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const KnowledgeBase = sequelize.define('KnowledgeBase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sourceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sourceType: {
    type: DataTypes.ENUM('meeting', 'manual', 'import'),
    defaultValue: 'manual'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true
});

module.exports = KnowledgeBase;
