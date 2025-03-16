import { Sequelize } from 'sequelize';
import config from '../config/database';

// Import model factories
import defineUser from './User';
import defineMeeting from './Meeting';
import defineTranscript from './Transcript';
import defineMeetingNote from './MeetingNote';
import defineTemplate from './Template';
import definePerson from './Person';
import defineProject from './Project';
import defineKnowledgeModels from './KnowledgeEntry';

// Initialize Sequelize with database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
  }
);

// Initialize models
const User = defineUser(sequelize);
const Meeting = defineMeeting(sequelize);
const Transcript = defineTranscript(sequelize);
const MeetingNote = defineMeetingNote(sequelize);
const Template = defineTemplate(sequelize);
const Person = definePerson(sequelize);
const Project = defineProject(sequelize);
const { KnowledgeEntry, KnowledgeConnection } = defineKnowledgeModels(sequelize);

// Create models object
const models = {
  User,
  Meeting,
  Transcript,
  MeetingNote,
  Template,
  Person,
  Project,
  KnowledgeEntry,
  KnowledgeConnection,
};

// Run associations for each model
Object.keys(models).forEach((modelName) => {
  if ((models as any)[modelName].associate) {
    (models as any)[modelName].associate(models);
  }
});

export {
  sequelize,
  Sequelize,
  User,
  Meeting,
  Transcript,
  MeetingNote,
  Template,
  Person,
  Project,
  KnowledgeEntry,
  KnowledgeConnection,
};
