const { Op } = require('sequelize');
const { Meeting, MeetingNote, Person, Project, KnowledgeBase, Transcript } = require('../models');

/**
 * Search across all content types
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Search results
 */
const searchAll = async (query, filters = {}, userId) => {
  try {
    // Run all searches in parallel
    const [meetings, people, projects, knowledgeBase] = await Promise.all([
      searchMeetings(query, filters, userId),
      searchPeople(query, filters, userId),
      searchProjects(query, filters, userId),
      searchKnowledgeBase(query, filters, userId)
    ]);
    
    return {
      meetings,
      people,
      projects,
      knowledgeBase
    };
  } catch (error) {
    console.error('Error searching all content:', error);
    throw error;
  }
};

/**
 * Search meetings
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Meeting search results
 */
const searchMeetings = async (query, filters = {}, userId) => {
  try {
    // Build search conditions
    const whereConditions = {
      createdBy: userId,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } }
      ]
    };
    
    // Apply date range filters if provided
    if (filters.startDate && filters.endDate) {
      whereConditions.startTime = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }
    
    // Apply status filter if provided
    if (filters.status) {
      whereConditions.status = filters.status;
    }
    
    // Search meetings
    const meetings = await Meeting.findAll({
      where: whereConditions,
      include: [
        { 
          model: Transcript,
          as: 'transcript',
          required: false
        },
        {
          model: MeetingNote,
          as: 'notes',
          required: false
        },
        {
          model: Person,
          as: 'attendees',
          required: false
        }
      ],
      order: [['startTime', 'DESC']],
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
    
    // Filter meetings to include those with matching transcript content
    const filteredMeetings = meetings.filter(meeting => {
      // If meeting name matches, include it
      if (meeting.name.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
      
      // Check transcript content if available
      if (meeting.transcript && meeting.transcript.content) {
        return meeting.transcript.content.some(segment => 
          segment.text && segment.text.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Check meeting notes if available
      if (meeting.notes && meeting.notes.length > 0) {
        return meeting.notes.some(note => 
          (note.summary && note.summary.toLowerCase().includes(query.toLowerCase())) ||
          (note.content && JSON.stringify(note.content).toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      return false;
    });
    
    return filteredMeetings;
  } catch (error) {
    console.error('Error searching meetings:', error);
    throw error;
  }
};

/**
 * Search people
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @param {string} userId - User ID
 * @returns {Promise<Array>} People search results
 */
const searchPeople = async (query, filters = {}, userId) => {
  try {
    // Build search conditions
    const whereConditions = {
      createdBy: userId,
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${query}%` } },
        { lastName: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } }
      ]
    };
    
    // Apply tag filters if provided
    if (filters.tags && filters.tags.length > 0) {
      whereConditions.tags = {
        [Op.overlap]: filters.tags
      };
    }
    
    // Search people
    const people = await Person.findAll({
      where: whereConditions,
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
    
    return people;
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
};

/**
 * Search projects
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Project search results
 */
const searchProjects = async (query, filters = {}, userId) => {
  try {
    // Build search conditions
    const whereConditions = {
      createdBy: userId,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ]
    };
    
    // Apply status filter if provided
    if (filters.status) {
      whereConditions.status = filters.status;
    }
    
    // Search projects
    const projects = await Project.findAll({
      where: whereConditions,
      include: [
        {
          model: Meeting,
          as: 'meetings',
          required: false
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
    
    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

/**
 * Search knowledge base
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Knowledge base search results
 */
const searchKnowledgeBase = async (query, filters = {}, userId) => {
  try {
    // Build search conditions
    const whereConditions = {
      userId,
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } }
      ]
    };
    
    // Apply tag filters if provided
    if (filters.tags && filters.tags.length > 0) {
      whereConditions.tags = {
        [Op.overlap]: filters.tags
      };
    }
    
    // Apply date range filters if provided
    if (filters.startDate && filters.endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }
    
    // Apply source type filter if provided
    if (filters.sourceType) {
      whereConditions.sourceType = filters.sourceType;
    }
    
    // Search knowledge base
    const results = await KnowledgeBase.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
    
    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw error;
  }
};

module.exports = {
  searchAll,
  searchMeetings,
  searchPeople,
  searchProjects,
  searchKnowledgeBase
};
