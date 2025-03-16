import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Template extends Model {
  public id!: number
  public name!: string
  public description!: string | null
  public type!: 'meeting' | 'project' | 'person'
  public structure!: any // JSONB
  public systemPrompt!: string | null
  public userId!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Template.init(
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
    type: {
      type: DataTypes.ENUM('meeting', 'project', 'person'),
      allowNull: false
    },
    structure: {
      type: DataTypes.JSONB,
      allowNull: false
      // Structure for meeting template:
      // {
      //   sections: [
      //     {
      //       id: string,
      //       title: string,
      //       description: string,
      //       required: boolean
      //     }
      //   ]
      // }
      
      // Structure for project template:
      // {
      //   sections: [
      //     {
      //       id: string,
      //       title: string,
      //       description: string,
      //       required: boolean
      //     }
      //   ],
      //   goalCategories: string[],
      //   taskCategories: string[]
      // }
      
      // Structure for person template:
      // {
      //   sections: [
      //     {
      //       id: string,
      //       title: string,
      //       description: string,
      //       required: boolean
      //     }
      //   ]
      // }
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Template'
  }
)

export default Template
