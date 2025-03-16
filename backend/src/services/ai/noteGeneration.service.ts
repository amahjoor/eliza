import { OpenAI } from 'openai';
import { sequelize } from '../../models';
import { NoteGenerationOptions } from '../../types/ai';

// Import models
const Meeting = sequelize.models.Meeting;
const Transcript = sequelize.models.Transcript;
const MeetingNote = sequelize.models.MeetingNote;
const Template = sequelize.models.Template;
const User = sequelize.models.User;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate meeting notes from transcript using AI
 */
export const generateMeetingNotes = async (
  meetingId: string,
  userId: string,
  templateId?: string,
  customInstructions?: string
): Promise<any> => {
  try {
    // Fetch meeting and transcript data
    const meeting = await Meeting.findByPk(meetingId, {
      include: [{ model: Transcript, where: { processingStatus: 'completed' } }]
    });

    if (!meeting) {
      throw new Error('Meeting not found or transcript not completed');
    }

    // Get user settings for AI preferences
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user AI settings
    const aiSettings = user.settings?.ai || {};
    const detailLevel = aiSettings.noteDetailLevel || 3; // Default to medium detail

    // Get template if specified
    let template;
    if (templateId) {
      template = await Template.findByPk(templateId);
    } else if (aiSettings.defaultTemplateId) {
      template = await Template.findByPk(aiSettings.defaultTemplateId);
    } else {
      // Use default template
      template = await Template.findOne({ where: { isDefault: true, type: 'meeting_note' } });
    }

    if (!template) {
      throw new Error('Template not found');
    }

    // Prepare transcript text
    const transcriptText = meeting.Transcripts[0].content;
    
    // Prepare system prompt
    const systemPrompt = template.systemPrompt || 
      `You are an AI assistant that creates concise, well-structured meeting notes. 
      Analyze the meeting transcript and create professional notes with the following sections:
      1. Summary
      2. Key Discussion Points
      3. Decisions Made
      4. Action Items (with assignees if mentioned)
      5. Follow-up Questions
      
      Detail level: ${detailLevel}/5 (where 1 is very concise and 5 is very detailed)`;

    // Add custom instructions if provided
    const finalSystemPrompt = customInstructions 
      ? `${systemPrompt}\n\nAdditional instructions: ${customInstructions}`
      : systemPrompt;

    // Generate meeting notes using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: `Meeting Title: ${meeting.title}\nDate: ${meeting.date}\nTranscript:\n${transcriptText}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';

    // Parse action items from the content
    const actionItems = extractActionItems(aiContent);

    // Create meeting note
    const meetingNote = await MeetingNote.create({
      meetingId,
      userId,
      content: aiContent,
      format: 'markdown',
      actionItems,
      aiGenerated: true,
      templateId: template.id,
      outline: generateOutline(aiContent),
      summary: extractSummary(aiContent)
    });

    return meetingNote;
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    throw error;
  }
};

/**
 * Extract action items from meeting notes
 */
const extractActionItems = (content: string): Array<{
  task: string;
  assignee: string;
  status: string;
  dueDate: string | null;
}> => {
  const actionItems: Array<{
    task: string;
    assignee: string;
    status: string;
    dueDate: string | null;
  }> = [];
  const actionItemRegex = /\b([A-Z][a-z]+ (?:[A-Z][a-z]+ )?(?:to|will|should|must|needs to)) (.*?)(?:\.|$)/gm;
  
  let match;
  while ((match = actionItemRegex.exec(content)) !== null) {
    const [_, assigneeAction, task] = match;
    const assignee = assigneeAction.split(' ')[0]; // Extract name
    
    actionItems.push({
      task: `${assigneeAction} ${task}`.trim(),
      assignee,
      status: 'pending',
      dueDate: null
    });
  }
  
  return actionItems;
};

/**
 * Generate outline from meeting notes
 */
const generateOutline = (content: string): Array<{
  title: string;
  items: Array<string | { title: string; items: string[] }>;
}> => {
  const outline: Array<{
    title: string;
    items: Array<string | { title: string; items: string[] }>;
  }> = [];
  const lines = content.split('\n');
  
  let currentSection: {
    title: string;
    items: Array<string | { title: string; items: string[] }>;
  } | null = null;
  let currentSubsection: {
    title: string;
    items: string[];
  } | null = null;
  
  for (const line of lines) {
    // Check for main headings (# or ##)
    if (line.startsWith('# ')) {
      currentSection = {
        title: line.substring(2).trim(),
        items: []
      };
      outline.push(currentSection);
      currentSubsection = null;
    } 
    // Check for subheadings (## or ###)
    else if (line.startsWith('## ')) {
      if (!currentSection) {
        currentSection = {
          title: 'Notes',
          items: []
        };
        outline.push(currentSection);
      }
      
      currentSubsection = {
        title: line.substring(3).trim(),
        items: []
      };
      currentSection.items.push(currentSubsection);
    }
    // Check for bullet points
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const item = line.trim().substring(2).trim();
      
      if (currentSubsection) {
        currentSubsection.items.push(item);
      } else if (currentSection) {
        currentSection.items.push(item);
      }
    }
  }
  
  return outline;
};

/**
 * Extract summary from meeting notes
 */
const extractSummary = (content: string): string => {
  // Look for a section titled "Summary" or similar
  const summaryRegex = /(?:^|\n)(?:# |## )(?:Summary|Overview|Executive Summary)(?:\n|$)([\s\S]*?)(?:\n# |\n## |$)/i;
  const match = content.match(summaryRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no summary section found, use the first paragraph
  const firstParagraph = content.split('\n\n')[0];
  return firstParagraph.trim();
};

/**
 * Generate custom meeting notes with specific parameters
 */
export const generateCustomMeetingNotes = async (
  meetingId: string,
  userId: string,
  options: NoteGenerationOptions
): Promise<any> => {
  try {
    // Fetch meeting and transcript data
    const meeting = await Meeting.findByPk(meetingId, {
      include: [{ model: Transcript, where: { processingStatus: 'completed' } }]
    });

    if (!meeting) {
      throw new Error('Meeting not found or transcript not completed');
    }

    // Prepare transcript text
    const transcriptText = meeting.Transcripts[0].content;
    
    // Build custom system prompt based on options
    let systemPrompt = `You are an AI assistant that creates professional meeting notes.`;
    
    // Add style instructions
    if (options.style) {
      switch (options.style) {
        case 'concise':
          systemPrompt += ` Create very concise notes focusing only on the most important points.`;
          break;
        case 'detailed':
          systemPrompt += ` Create comprehensive, detailed notes capturing all discussion points.`;
          break;
        case 'technical':
          systemPrompt += ` Create technically-focused notes emphasizing technical details and specifications.`;
          break;
        case 'executive':
          systemPrompt += ` Create executive-style notes focusing on decisions, action items, and high-level insights.`;
          break;
      }
    }
    
    // Add focus areas
    if (options.focusAreas && options.focusAreas.length > 0) {
      systemPrompt += ` Pay special attention to these topics: ${options.focusAreas.join(', ')}.`;
    }
    
    // Add exclusion topics
    if (options.excludeTopics && options.excludeTopics.length > 0) {
      systemPrompt += ` Do not include information about: ${options.excludeTopics.join(', ')}.`;
    }
    
    // Add length constraint
    if (options.maxLength) {
      systemPrompt += ` Keep the notes under approximately ${options.maxLength} words.`;
    }
    
    // Generate meeting notes using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Meeting Title: ${meeting.title}\nDate: ${meeting.date}\nTranscript:\n${transcriptText}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';

    // Create meeting note
    const meetingNote = await MeetingNote.create({
      meetingId,
      userId,
      content: aiContent,
      format: options.format || 'markdown',
      actionItems: extractActionItems(aiContent),
      aiGenerated: true,
      outline: generateOutline(aiContent),
      summary: extractSummary(aiContent)
    });

    return meetingNote;
  } catch (error) {
    console.error('Error generating custom meeting notes:', error);
    throw error;
  }
};
