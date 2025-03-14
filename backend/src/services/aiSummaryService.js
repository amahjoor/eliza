const { Configuration, OpenAIApi } = require('openai');
const { Meeting, MeetingNote, Template } = require('../models');

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate meeting summary, action items, and outline from transcript
 * @param {string} meetingId - Meeting ID
 * @param {Array} transcriptSegments - Transcript segments with speaker information
 * @returns {Promise<Object>} - Created meeting notes
 */
const generateMeetingSummary = async (meetingId, transcriptSegments) => {
  try {
    // Get meeting data
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }
    
    // Get template if specified
    let template = null;
    if (meeting.templateId) {
      template = await Template.findByPk(meeting.templateId);
    }
    
    // Prepare transcript text for AI processing
    const transcriptText = transcriptSegments.map(segment => 
      `${segment.speaker} (${segment.time}): ${segment.text}`
    ).join('\n');
    
    // Create system prompt based on template or default
    const systemPrompt = template?.systemPrompt || 
      "You are an AI assistant that creates concise, accurate meeting summaries. Extract key points, action items, and create a structured outline.";
    
    // Generate summary using OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this meeting transcript and provide: 
          1. A concise executive summary (max 3 paragraphs)
          2. A structured outline of the main topics discussed
          3. A list of action items with assignees and deadlines (if mentioned)
          
          Meeting Title: ${meeting.name}
          Date: ${meeting.startTime}
          
          Transcript:
          ${transcriptText}` 
        }
      ],
      temperature: 0.3,
    });
    
    const aiResponse = completion.data.choices[0].message.content;
    
    // Parse AI response to extract summary, outline, and action items
    const { summary, outline, actionItems } = parseAIResponse(aiResponse);
    
    // Create or update meeting notes
    let meetingNote = await MeetingNote.findOne({ where: { meetingId } });
    
    if (meetingNote) {
      await meetingNote.update({
        summary,
        outline,
        actionItems,
        content: { 
          summary, 
          outline, 
          actionItems,
          fullText: aiResponse 
        },
        templateId: meeting.templateId,
        aiGenerated: true
      });
    } else {
      meetingNote = await MeetingNote.create({
        meetingId,
        summary,
        outline,
        actionItems,
        content: { 
          summary, 
          outline, 
          actionItems,
          fullText: aiResponse 
        },
        templateId: meeting.templateId,
        aiGenerated: true
      });
    }
    
    return meetingNote;
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    throw error;
  }
};

/**
 * Parse AI response to extract structured data
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} - Parsed summary, outline, and action items
 */
const parseAIResponse = (aiResponse) => {
  // Default structure
  const result = {
    summary: '',
    outline: [],
    actionItems: []
  };
  
  try {
    // Extract summary (assuming it's at the beginning until "Outline" or similar heading)
    const summaryMatch = aiResponse.match(/(?:Summary|Executive Summary):([\s\S]*?)(?=\n\s*(?:Outline|Main Topics|Action Items))/i);
    if (summaryMatch && summaryMatch[1]) {
      result.summary = summaryMatch[1].trim();
    } else {
      // Fallback: take first paragraph
      const firstParagraph = aiResponse.split('\n\n')[0];
      result.summary = firstParagraph.trim();
    }
    
    // Extract outline
    const outlineMatch = aiResponse.match(/(?:Outline|Main Topics):([\s\S]*?)(?=\n\s*(?:Action Items|$))/i);
    if (outlineMatch && outlineMatch[1]) {
      const outlineText = outlineMatch[1].trim();
      const topics = outlineText.split(/\n\s*\d+\.\s+/).filter(Boolean);
      
      result.outline = topics.map(topic => {
        const [title, ...items] = topic.split(/\n\s*[-•]\s+/);
        return {
          title: title.trim(),
          items: items.filter(Boolean).map(item => item.trim())
        };
      });
    }
    
    // Extract action items
    const actionItemsMatch = aiResponse.match(/Action Items:([\s\S]*?)(?=$)/i);
    if (actionItemsMatch && actionItemsMatch[1]) {
      const actionItemsText = actionItemsMatch[1].trim();
      const actionItems = actionItemsText.split(/\n\s*[-•]\s+/).filter(Boolean);
      
      result.actionItems = actionItems.map(item => {
        const assigneeMatch = item.match(/([^:]+):\s*(.*)/);
        if (assigneeMatch) {
          return {
            assignee: assigneeMatch[1].trim(),
            task: assigneeMatch[2].trim(),
            dueDate: extractDueDate(item)
          };
        }
        return {
          assignee: extractAssignee(item),
          task: item.trim(),
          dueDate: extractDueDate(item)
        };
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      summary: aiResponse.substring(0, 500),
      outline: [],
      actionItems: []
    };
  }
};

/**
 * Extract assignee from action item text
 * @param {string} text - Action item text
 * @returns {string} - Extracted assignee or empty string
 */
const extractAssignee = (text) => {
  const assigneeMatch = text.match(/\(([^)]+)\)/);
  return assigneeMatch ? assigneeMatch[1].trim() : '';
};

/**
 * Extract due date from action item text
 * @param {string} text - Action item text
 * @returns {string} - Extracted due date or empty string
 */
const extractDueDate = (text) => {
  const dateMatch = text.match(/by\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4})/i);
  return dateMatch ? dateMatch[1].trim() : '';
};

module.exports = {
  generateMeetingSummary
};
