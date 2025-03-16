import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface TemplateAttributes {
  id: string;
  name: string;
  description?: string;
  type: 'meeting_note' | 'email' | 'report';
  content: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateCreationAttributes extends Optional<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface TemplateInstance extends Model<TemplateAttributes, TemplateCreationAttributes>, TemplateAttributes {}

export default (sequelize: Sequelize) => {
  const Template = sequelize.define<TemplateInstance>(
    'Template',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      type: {
        type: DataTypes.ENUM('meeting_note', 'email', 'report'),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      timestamps: true
    }
  );

  Template.associate = (models: any) => {
    Template.belongsTo(models.User, { foreignKey: 'createdBy' });
    Template.hasMany(models.MeetingNote, { foreignKey: 'templateId' });
  };

  return Template;
};
