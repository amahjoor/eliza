import { OpenAI } from 'openai';
import { NoteGenerationOptions, GeneratedNote } from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Generates meeting notes from a transcript using AI
 * @param transcriptId ID of the transcript to generate notes from
 * @param options Options for note generation
 * @returns Generated meeting notes
 */
export async function generateMeetingNotes(
  transcriptId: string,
  options: NoteGenerationOptions
): Promise<GeneratedNote> {
  try {
    // Fetch transcript from database
    const transcript = await fetchTranscript(transcriptId);
    
    if (!transcript) {
      throw new Error(`Transcript with ID ${transcriptId} not found`);
    }
    
    // Generate system prompt based on options
    const systemPrompt = generateSystemPrompt(options);
    
    // Generate user prompt with transcript content
    const userPrompt = generateUserPrompt(transcript);
    
    // Call OpenAI API to generate notes
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract sections from the generated content
    const { title, summary, actionItems, followUps, mainContent } = parseGeneratedContent(content);
    
    // Create the note object
    const note: GeneratedNote = {
      title: title || 'Meeting Notes',
      content: mainContent,
      metadata: {
        generatedAt: new Date(),
        modelUsed: 'gpt-4-turbo',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0
      }
    };
    
    // Add optional sections if requested and available
    if (options.includeSummary && summary) {
      note.summary = summary;
    }
    
    if (options.includeActionItems && actionItems.length > 0) {
      note.actionItems = actionItems;
    }
    
    if (options.includeFollowUps && followUps.length > 0) {
      note.followUps = followUps;
    }
    
    return note;
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    throw new Error('Failed to generate meeting notes');
  }
}

/**
 * Generates custom meeting notes based on a template
 * @param transcriptId ID of the transcript to generate notes from
 * @param templateId ID of the template to use
 * @param options Options for note generation
 * @returns Generated meeting notes
 */
export async function generateCustomMeetingNotes(
  transcriptId: string,
  templateId: string,
  options: NoteGenerationOptions
): Promise<GeneratedNote> {
  try {
    // Fetch transcript from database
    const transcript = await fetchTranscript(transcriptId);
    
    if (!transcript) {
      throw new Error(`Transcript with ID ${transcriptId} not found`);
    }
    
    // Fetch template from database
    const template = await fetchTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Generate system prompt based on template and options
    const systemPrompt = generateTemplateBasedPrompt(template, options);
    
    // Generate user prompt with transcript content
    const userPrompt = generateUserPrompt(transcript);
    
    // Call OpenAI API to generate notes
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract sections from the generated content
    const { title, summary, actionItems, followUps, mainContent } = parseGeneratedContent(content);
    
    // Create the note object
    const note: GeneratedNote = {
      title: title || template.name,
      content: mainContent,
      metadata: {
        generatedAt: new Date(),
        modelUsed: 'gpt-4-turbo',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0
      }
    };
    
    // Add optional sections if requested and available
    if (options.includeSummary && summary) {
      note.summary = summary;
    }
    
    if (options.includeActionItems && actionItems.length > 0) {
      note.actionItems = actionItems;
    }
    
    if (options.includeFollowUps && followUps.length > 0) {
      note.followUps = followUps;
    }
    
    return note;
  } catch (error) {
    console.error('Error generating custom meeting notes:', error);
    throw new Error('Failed to generate custom meeting notes');
  }
}

/**
 * Fetches a transcript from the database
 * @param transcriptId ID of the transcript to fetch
 * @returns Transcript object or null if not found
 */
async function fetchTranscript(transcriptId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock transcript
  return {
    id: transcriptId,
    meetingId: 'meeting-123',
    content: 'This is a sample transcript content.',
    segments: [
      {
        speakerId: 'speaker-1',
        speakerName: 'John Doe',
        text: 'Hello everyone, let\'s start the meeting.',
        startTime: 0,
        endTime: 5
      },
      {
        speakerId: 'speaker-2',
        speakerName: 'Jane Smith',
        text: 'I have some updates on the project.',
        startTime: 6,
        endTime: 10
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Fetches a template from the database
 * @param templateId ID of the template to fetch
 * @returns Template object or null if not found
 */
async function fetchTemplate(templateId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock template
  return {
    id: templateId,
    name: 'Executive Summary',
    description: 'A concise summary for executives',
    type: 'meeting_note',
    content: '# {{title}}\n\n## Executive Summary\n{{summary}}\n\n## Key Decisions\n{{decisions}}\n\n## Action Items\n{{action_items}}',
    createdBy: 'user-123',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Generates a system prompt based on the provided options
 * @param options Options for note generation
 * @returns System prompt for the AI
 */
function generateSystemPrompt(options: NoteGenerationOptions): string {
  let detailLevel = '';
  switch (options.detailLevel) {
    case 1:
      detailLevel = 'very concise';
      break;
    case 2:
      detailLevel = 'moderately detailed';
      break;
    case 3:
      detailLevel = 'comprehensive';
      break;
    default:
      detailLevel = 'moderately detailed';
  }
  
  let systemPrompt = `You are an expert meeting note-taker. Your task is to create ${detailLevel} meeting notes from the transcript I will provide. `;
  
  if (options.format === 'markdown') {
    systemPrompt += 'Format your response in Markdown. ';
  } else if (options.format === 'html') {
    systemPrompt += 'Format your response in HTML. ';
  }
  
  if (options.includeActionItems) {
    systemPrompt += 'Include a section for action items with assignees if mentioned. ';
  }
  
  if (options.includeFollowUps) {
    systemPrompt += 'Include a section for follow-up items. ';
  }
  
  if (options.includeSummary) {
    systemPrompt += 'Start with a brief summary of the meeting. ';
  }
  
  if (options.style) {
    switch (options.style) {
      case 'formal':
        systemPrompt += 'Use a formal, professional tone. ';
        break;
      case 'casual':
        systemPrompt += 'Use a casual, conversational tone. ';
        break;
      case 'technical':
        systemPrompt += 'Use a technical, precise tone with appropriate terminology. ';
        break;
    }
  }
  
  if (options.focusAreas && options.focusAreas.length > 0) {
    systemPrompt += ` Pay special attention to these topics: ${options.focusAreas.join(', ')}.`;
  }
  
  if (options.excludeTopics && options.excludeTopics.length > 0) {
    systemPrompt += ` Do not include information about: ${options.excludeTopics.join(', ')}.`;
  }
  
  if (options.maxLength) {
    systemPrompt += ` Keep the notes under approximately ${options.maxLength} words.`;
  }
  
  return systemPrompt;
}

/**
 * Generates a template-based system prompt
 * @param template Template object
 * @param options Options for note generation
 * @returns System prompt for the AI
 */
function generateTemplateBasedPrompt(template: any, options: NoteGenerationOptions): string {
  let systemPrompt = `You are an expert meeting note-taker. Your task is to create meeting notes from the transcript I will provide, following this specific template structure:\n\n${template.content}\n\n`;
  
  if (options.format === 'markdown') {
    systemPrompt += 'Format your response in Markdown. ';
  } else if (options.format === 'html') {
    systemPrompt += 'Format your response in HTML. ';
  }
  
  return systemPrompt;
}

/**
 * Generates a user prompt with the transcript content
 * @param transcript Transcript object
 * @returns User prompt for the AI
 */
function generateUserPrompt(transcript: any): string {
  let userPrompt = 'Here is the meeting transcript:\n\n';
  
  if (transcript.segments && transcript.segments.length > 0) {
    transcript.segments.forEach((segment: any) => {
      userPrompt += `${segment.speakerName}: ${segment.text}\n`;
    });
  } else {
    userPrompt += transcript.content;
  }
  
  return userPrompt;
}

/**
 * Parses the generated content into sections
 * @param content Generated content from the AI
 * @returns Parsed sections
 */
function parseGeneratedContent(content: string): {
  title: string;
  summary: string;
  actionItems: Array<{
    description: string;
    assignee?: string;
    dueDate?: Date;
  }>;
  followUps: Array<{
    description: string;
    participants: string[];
  }>;
  mainContent: string;
} {
  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Extract summary
  const summaryMatch = content.match(/##\s+Summary\s*\n([\s\S]*?)(?=##|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  
  // Extract action items
  const actionItemsMatch = content.match(/##\s+Action\s+Items\s*\n([\s\S]*?)(?=##|$)/i);
  const actionItemsText = actionItemsMatch ? actionItemsMatch[1] : '';
  
  const actionItems = actionItemsText
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => {
      const itemText = line.replace(/^[-*]\s+/, '').trim();
      const assigneeMatch = itemText.match(/\(([^)]+)\)/);
      const assignee = assigneeMatch ? assigneeMatch[1] : undefined;
      
      const dueDateMatch = itemText.match(/by\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4})/i);
      const dueDateStr = dueDateMatch ? dueDateMatch[1] : undefined;
      const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
      
      return {
        description: itemText,
        assignee,
        dueDate
      };
    });
  
  // Extract follow-ups
  const followUpsMatch = content.match(/##\s+Follow-ups\s*\n([\s\S]*?)(?=##|$)/i);
  const followUpsText = followUpsMatch ? followUpsMatch[1] : '';
  
  const followUps = followUpsText
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => {
      const itemText = line.replace(/^[-*]\s+/, '').trim();
      const participantsMatch = itemText.match(/\(([^)]+)\)/);
      const participants = participantsMatch 
        ? participantsMatch[1].split(',').map(p => p.trim()) 
        : [];
      
      return {
        description: itemText,
        participants
      };
    });
  
  // Main content is everything except the extracted sections
  let mainContent = content;
  
  // Remove title
  if (titleMatch) {
    mainContent = mainContent.replace(titleMatch[0], '');
  }
  
  // Remove summary section
  if (summaryMatch) {
    mainContent = mainContent.replace(summaryMatch[0], '');
  }
  
  // Remove action items section
  if (actionItemsMatch) {
    mainContent = mainContent.replace(actionItemsMatch[0], '');
  }
  
  // Remove follow-ups section
  if (followUpsMatch) {
    mainContent = mainContent.replace(followUpsMatch[0], '');
  }
  
  // Clean up the main content
  mainContent = mainContent.trim();
  
  return {
    title,
    summary,
    actionItems,
    followUps,
    mainContent
  };
}
