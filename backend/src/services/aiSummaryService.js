const { OpenAI } = require('openai');
const { Meeting, MeetingNote } = require('../models');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate meeting summary from transcript segments
 * @param {string} meetingId - ID of the meeting
 * @param {Array} segments - Transcript segments
 * @returns {Promise<Object>} Generated summary
 */
const generateMeetingSummary = async (meetingId, segments) => {
  try {
    const meeting = await Meeting.findByPk(meetingId);
    
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }
    
    // Prepare transcript text for OpenAI
    const transcriptText = segments.map(segment => 
      `[${segment.time}] ${segment.speaker}: ${segment.text}`
    ).join('\n');
    
    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an AI assistant that creates concise, accurate meeting summaries. Identify key points, decisions, and action items.' 
        },
        { 
          role: 'user', 
          content: `Please create a summary of the following meeting transcript:\n\n${transcriptText}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    // Extract the generated summary
    const summary = completion.choices[0].message.content;
    
    // Generate structured data (topics, action items, etc.)
    const structuredCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Extract structured data from meeting transcripts including topics discussed, action items, and key decisions.' 
        },
        { 
          role: 'user', 
          content: `Based on this meeting transcript, create a JSON object with three arrays: "topics" (main topics discussed), "actionItems" (tasks with assignee and due date if mentioned), and "decisions" (key decisions made):\n\n${transcriptText}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });
    
    // Parse the structured data
    const structuredData = JSON.parse(structuredCompletion.choices[0].message.content);
    
    // Create meeting note in database
    const meetingNote = await MeetingNote.create({
      meetingId,
      summary,
      topics: structuredData.topics || [],
      actionItems: structuredData.actionItems || [],
      decisions: structuredData.decisions || [],
      content: {
        summary,
        topics: structuredData.topics || [],
        actionItems: structuredData.actionItems || [],
        decisions: structuredData.decisions || []
      },
      format: 'markdown',
      aiGenerated: true
    });
    
    return meetingNote;
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    throw error;
  }
};

/**
 * Generate insights from multiple meetings
 * @param {Array} meetingIds - Array of meeting IDs
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated insights
 */
const generateMeetingInsights = async (meetingIds, options = {}) => {
  try {
    // Get meetings with notes
    const meetings = await Meeting.findAll({
      where: { id: meetingIds },
      include: [{ model: MeetingNote, as: 'notes' }]
    });
    
    if (meetings.length === 0) {
      throw new Error('No meetings found');
    }
    
    // Prepare meeting data for OpenAI
    const meetingData = meetings.map(meeting => ({
      id: meeting.id,
      name: meeting.name,
      date: meeting.startTime,
      summary: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].summary : 'No summary available',
      topics: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].topics : [],
      actionItems: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].actionItems : [],
      decisions: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].decisions : []
    }));
    
    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an AI assistant that analyzes multiple meetings to identify patterns, recurring topics, and track progress on action items.' 
        },
        { 
          role: 'user', 
          content: `Please analyze the following meetings and generate insights about trends, recurring topics, and progress on action items. Format your response as a JSON object with sections for "trends", "recurringTopics", "actionItemProgress", and "recommendations":\n\n${JSON.stringify(meetingData)}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });
    
    // Parse the insights
    const insights = JSON.parse(completion.choices[0].message.content);
    
    return {
      meetingsAnalyzed: meetings.length,
      timeRange: {
        start: new Date(Math.min(...meetings.map(m => new Date(m.startTime).getTime()))),
        end: new Date(Math.max(...meetings.map(m => new Date(m.startTime).getTime())))
      },
      insights
    };
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    throw error;
  }
};

module.exports = {
  generateMeetingSummary,
  generateMeetingInsights
};
