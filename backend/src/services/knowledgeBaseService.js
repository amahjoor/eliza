const { Op } = require('sequelize');
const { KnowledgeBase, Meeting, MeetingNote, Transcript, Person } = require('../models');
const { Configuration, OpenAIApi } = require('openai');

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Search knowledge base for entries matching query
 * @param {string} query - Search query
 * @param {Object} filters - Optional filters (tags, date range, etc.)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Search results
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
    
    // If direct knowledge base search yields few results, search in meetings and transcripts
    if (results.length < 5) {
      const meetingResults = await searchMeetingsAndTranscripts(query, userId);
      
      // Create knowledge base entries from meeting results
      for (const meeting of meetingResults) {
        // Check if entry already exists
        const existingEntry = await KnowledgeBase.findOne({
          where: {
            sourceId: meeting.id,
            sourceType: 'meeting',
            userId
          }
        });
        
        if (!existingEntry) {
          // Create new knowledge base entry from meeting
          await KnowledgeBase.create({
            title: meeting.name,
            content: meeting.transcript ? JSON.stringify(meeting.transcript.content) : '',
            tags: ['meeting', 'auto-generated'],
            source: meeting.name,
            sourceId: meeting.id,
            sourceType: 'meeting',
            userId
          });
        }
      }
      
      // Re-run the search to include newly created entries
      const updatedResults = await KnowledgeBase.findAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 20,
        offset: filters.offset || 0
      });
      
      return updatedResults;
    }
    
    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw error;
  }
};

/**
 * Search meetings and transcripts for content matching query
 * @param {string} query - Search query
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Matching meetings with transcripts
 */
const searchMeetingsAndTranscripts = async (query, userId) => {
  try {
    // Search in meeting names and transcripts
    const meetings = await Meeting.findAll({
      where: {
        createdBy: userId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { 
          model: Transcript,
          as: 'transcript'
        },
        {
          model: MeetingNote,
          as: 'notes'
        }
      ],
      limit: 10
    });
    
    // Filter meetings to those with matching transcript content
    const matchingMeetings = meetings.filter(meeting => {
      if (!meeting.transcript || !meeting.transcript.content) {
        return false;
      }
      
      // Check if any transcript segment contains the query
      return meeting.transcript.content.some(segment => 
        segment.text && segment.text.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    return matchingMeetings;
  } catch (error) {
    console.error('Error searching meetings and transcripts:', error);
    throw error;
  }
};

/**
 * Generate insights from knowledge base
 * @param {string} topic - Topic to generate insights for
 * @param {string} timeframe - Time period to analyze (e.g., 'week', 'month', 'quarter')
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Generated insights
 */
const generateInsights = async (topic, timeframe = 'month', userId) => {
  try {
    // Determine date range based on timeframe
    const endDate = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    // Get relevant knowledge base entries
    const entries = await KnowledgeBase.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        ...(topic ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${topic}%` } },
            { content: { [Op.iLike]: `%${topic}%` } },
            { tags: { [Op.contains]: [topic] } }
          ]
        } : {})
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Get relevant meetings
    const meetings = await Meeting.findAll({
      where: {
        createdBy: userId,
        startTime: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { 
          model: Transcript,
          as: 'transcript'
        },
        {
          model: MeetingNote,
          as: 'notes'
        },
        {
          model: Person,
          as: 'attendees'
        }
      ],
      limit: 20
    });
    
    // Filter meetings if topic is provided
    const filteredMeetings = topic ? meetings.filter(meeting => {
      // Check meeting name
      if (meeting.name.toLowerCase().includes(topic.toLowerCase())) {
        return true;
      }
      
      // Check transcript content
      if (meeting.transcript && meeting.transcript.content) {
        return meeting.transcript.content.some(segment => 
          segment.text && segment.text.toLowerCase().includes(topic.toLowerCase())
        );
      }
      
      // Check meeting notes
      if (meeting.notes && meeting.notes.length > 0) {
        return meeting.notes.some(note => 
          (note.summary && note.summary.toLowerCase().includes(topic.toLowerCase())) ||
          (note.content && JSON.stringify(note.content).toLowerCase().includes(topic.toLowerCase()))
        );
      }
      
      return false;
    }) : meetings;
    
    // Prepare data for AI analysis
    const knowledgeData = entries.map(entry => ({
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt
    }));
    
    const meetingData = filteredMeetings.map(meeting => ({
      name: meeting.name,
      date: meeting.startTime,
      transcript: meeting.transcript ? meeting.transcript.content : [],
      notes: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].summary : '',
      attendees: meeting.attendees ? meeting.attendees.map(person => `${person.firstName} ${person.lastName}`) : []
    }));
    
    // Generate insights using OpenAI
    const prompt = `
      Analyze the following knowledge base entries and meeting data to generate insights${topic ? ` about "${topic}"` : ''} over the past ${timeframe}.
      
      Knowledge Base Entries:
      ${JSON.stringify(knowledgeData)}
      
      Meeting Data:
      ${JSON.stringify(meetingData)}
      
      Please provide:
      1. A summary of key trends and patterns
      2. Important topics and their frequency
      3. Notable connections between different meetings/topics
      4. Action items that appear to be recurring or important
      5. People who are frequently involved in discussions${topic ? ` about "${topic}"` : ''}
      
      Format the response as a JSON object with the following structure:
      {
        "summary": "Overall summary of insights",
        "trends": [{"name": "Trend name", "description": "Description", "frequency": "High/Medium/Low"}],
        "topics": [{"name": "Topic name", "frequency": "High/Medium/Low", "relatedTopics": ["Related topic 1", "Related topic 2"]}],
        "connections": [{"source": "Source topic/meeting", "target": "Target topic/meeting", "relationship": "Description of relationship"}],
        "actionItems": [{"description": "Action item description", "frequency": "High/Medium/Low", "assignees": ["Person 1", "Person 2"]}],
        "people": [{"name": "Person name", "involvement": "High/Medium/Low", "topics": ["Topic 1", "Topic 2"]}]
      }
    `;
    
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant that analyzes meeting data and knowledge base entries to generate insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });
    
    // Parse and return insights
    const insights = JSON.parse(completion.data.choices[0].message.content);
    
    return {
      topic: topic || 'All Topics',
      timeframe,
      dateRange: {
        start: startDate,
        end: endDate
      },
      entriesAnalyzed: entries.length,
      meetingsAnalyzed: filteredMeetings.length,
      insights
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

module.exports = {
  searchKnowledgeBase,
  generateInsights
};
