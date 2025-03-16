import sequelize from '../config/database'
import User from './User'
import Meeting from './Meeting'
import MeetingNote from './MeetingNote'
import Transcript from './Transcript'
import Person from './Person'
import Project from './Project'
import Template from './Template'

// Define associations
User.hasMany(Meeting, { foreignKey: 'userId' })
Meeting.belongsTo(User, { foreignKey: 'userId' })

Meeting.hasOne(Transcript, { foreignKey: 'meetingId' })
Transcript.belongsTo(Meeting, { foreignKey: 'meetingId' })

Meeting.hasMany(MeetingNote, { foreignKey: 'meetingId' })
MeetingNote.belongsTo(Meeting, { foreignKey: 'meetingId' })

// Many-to-many: Meeting <-> Person (for attendees)
Meeting.belongsToMany(Person, { through: 'MeetingAttendee', as: 'attendees' })
Person.belongsToMany(Meeting, { through: 'MeetingAttendee', as: 'meetings' })

// Many-to-many: Project <-> Person (for team members)
Project.belongsToMany(Person, { through: 'ProjectMember', as: 'members' })
Person.belongsToMany(Project, { through: 'ProjectMember', as: 'projects' })

// Project <-> Meeting
Project.hasMany(Meeting, { foreignKey: 'projectId' })
Meeting.belongsTo(Project, { foreignKey: 'projectId' })

// User <-> Template
User.hasMany(Template, { foreignKey: 'userId' })
Template.belongsTo(User, { foreignKey: 'userId' })

export {
  sequelize,
  User,
  Meeting,
  MeetingNote,
  Transcript,
  Person,
  Project,
  Template
}
