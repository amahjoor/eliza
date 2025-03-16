import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Meeting, MeetingNote, Transcript, Person, Project } from '../models';
import { TypedRequest } from '../types';

interface SearchQueryParams {
  query: string;
  type?: string;
  limit?: string;
  offset?: string;
}

/**
 * Global search across meetings, notes, people, and projects
 */
export const globalSearch = async (req: TypedRequest<any, SearchQueryParams>, res: Response) => {
  try {
    const { query, type, limit = '10', offset = '0' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    
    // Base search options
    const searchOptions = {
      where: {},
      limit: limitNum,
      offset: offsetNum
    };
    
    let results: any = {};
    
    // If type is specified, search only that type
    if (type) {
      results = await searchByType(type, query, searchOptions);
    } else {
      // Search all types
      const [meetings, notes, transcripts, people, projects] = await Promise.all([
        searchMeetings(query, searchOptions),
        searchNotes(query, searchOptions),
        searchTranscripts(query, searchOptions),
        searchPeople(query, searchOptions),
        searchProjects(query, searchOptions)
      ]);
      
      results = {
        meetings,
        notes,
        transcripts,
        people,
        projects
      };
    }
    
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
};

/**
 * Search by specific type
 */
const searchByType = async (type: string, query: string, options: any) => {
  switch (type.toLowerCase()) {
    case 'meetings':
      return { meetings: await searchMeetings(query, options) };
    case 'notes':
      return { notes: await searchNotes(query, options) };
    case 'transcripts':
      return { transcripts: await searchTranscripts(query, options) };
    case 'people':
      return { people: await searchPeople(query, options) };
    case 'projects':
      return { projects: await searchProjects(query, options) };
    default:
      throw new Error(`Invalid search type: ${type}`);
  }
};

/**
 * Search meetings
 */
const searchMeetings = async (query: string, options: any) => {
  return Meeting.findAll({
    ...options,
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { status: { [Op.iLike]: `%${query}%` } }
      ]
    },
    include: [
      { model: Person, as: 'attendees', attributes: ['id', 'firstName', 'lastName'] },
      { model: Project, attributes: ['id', 'name'] }
    ]
  });
};

/**
 * Search meeting notes
 */
const searchNotes = async (query: string, options: any) => {
  return MeetingNote.findAll({
    ...options,
    where: {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } }
      ]
    },
    include: [
      { model: Meeting, attributes: ['id', 'name', 'startTime'] }
    ]
  });
};

/**
 * Search transcripts
 */
const searchTranscripts = async (query: string, options: any) => {
  return Transcript.findAll({
    ...options,
    where: {
      content: { [Op.iLike]: `%${query}%` }
    },
    include: [
      { model: Meeting, attributes: ['id', 'name', 'startTime'] }
    ]
  });
};

/**
 * Search people
 */
const searchPeople = async (query: string, options: any) => {
  return Person.findAll({
    ...options,
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${query}%` } },
        { lastName: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { organization: { [Op.iLike]: `%${query}%` } },
        { role: { [Op.iLike]: `%${query}%` } }
      ]
    }
  });
};

/**
 * Search projects
 */
const searchProjects = async (query: string, options: any) => {
  return Project.findAll({
    ...options,
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { status: { [Op.iLike]: `%${query}%` } }
      ]
    }
  });
};
