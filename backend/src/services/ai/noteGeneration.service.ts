import { OpenAI } from 'openai';
import { NoteGenerationOptions, GeneratedNote, ActionItem, FollowUp } from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Generates meeting notes based on a meeting transcript
 * @param meetingId ID of the meeting
 * @param options Options for note generation
 * @returns Generated meeting notes
 */
export async function generateMeetingNotes(
  meetingId: string,
  options: NoteGenerationOptions = {}
): Promise<GeneratedNote> {
  try {
    // Set default options
    const defaultOptions: NoteGenerationOptions = {
      detailLevel: 2,
      format: 'markdown',
      includeActionItems: true,
      includeFollowUps: true,
      includeSummary: true,
      style: 'formal'
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // In a real implementation, we would fetch meeting data from the database
    // For now, we'll use mock data
    const meeting = {
      id: meetingId,
      title: 'Project Planning Meeting',
      description: 'Discussion about project timeline and resource allocation',
      transcripts: [{ 
        content: 'This is a sample transcript content for testing purposes. ' +
                 'The team discussed project timelines and resource allocation. ' +
                 'Alice will handle the frontend development, and Bob will work on the backend. ' +
                 'We need to complete the initial prototype by next Friday.'
      }],
      attendees: [
        { name: 'Alice Smith', role: 'Frontend Developer' },
        { name: 'Bob Johnson', role: 'Backend Developer' },
        { name: 'Charlie Brown', role: 'Project Manager' }
      ],
      project: { name: 'Eliza AI Assistant' }
    };
    
    // Get transcript content
    const transcriptContent = meeting.transcripts[0].content;
    
    // Generate system prompt
    const systemPrompt = generateSystemPrompt(meeting, mergedOptions);
    
    // Generate user prompt with transcript content
    const userPrompt = `Here is the meeting transcript:\n\n${transcriptContent}`;
    
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
    
    // Extract notes, action items, and follow-ups from the generated content
    const { title, noteContent, summary, actionItems, followUps } = parseGeneratedContent(content);
    
    // Create the generated note object
    const generatedNote: GeneratedNote = {
      title: title || meeting.title,
      content: noteContent,
      format: mergedOptions.format || 'markdown',
      metadata: {
        generatedAt: new Date(),
        meetingId,
        options: mergedOptions
      }
    };
    
    // Add optional fields if they exist
    if (summary) {
      generatedNote.summary = summary;
    }
    
    if (actionItems && actionItems.length > 0) {
      generatedNote.actionItems = actionItems;
    }
    
    if (followUps && followUps.length > 0) {
      generatedNote.followUps = followUps;
    }
    
    return generatedNote;
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    throw new Error('Failed to generate meeting notes');
  }
}

/**
 * Generates custom meeting notes based on a template
 * @param meetingId ID of the meeting
 * @param templateId ID of the template
 * @param options Options for note generation
 * @returns Generated meeting notes
 */
export async function generateCustomMeetingNotes(
  meetingId: string,
  templateId: string,
  options: NoteGenerationOptions = {}
): Promise<GeneratedNote> {
  try {
    // In a real implementation, we would fetch the template from the database
    // For now, we'll use mock data
    const template = {
      id: templateId,
      name: 'Standard Meeting Template',
      content: `# {{title}}

## Summary
{{summary}}

## Discussion Points
{{content}}

## Action Items
{{actionItems}}

## Follow-ups
{{followUps}}

Generated on {{date}} at {{time}}`
    };
    
    // Set template-specific options
    const templateOptions: NoteGenerationOptions = {
      ...options,
      templateId
    };
    
    // Generate notes using the template
    const generatedNote = await generateMeetingNotes(meetingId, templateOptions);
    
    // Apply template formatting
    const formattedNote = applyTemplate(generatedNote, template);
    
    return formattedNote;
  } catch (error) {
    console.error('Error generating custom meeting notes:', error);
    throw new Error('Failed to generate custom meeting notes');
  }
}

/**
 * Generates a system prompt for the AI based on meeting data and options
 * @param meeting Meeting data
 * @param options Note generation options
 * @returns System prompt for the AI
 */
function generateSystemPrompt(meeting: any, options: NoteGenerationOptions): string {
  // Determine detail level description
  let detailLevelDesc = 'balanced';
  if (options.detailLevel === 1) {
    detailLevelDesc = 'concise';
  } else if (options.detailLevel === 3) {
    detailLevelDesc = 'comprehensive';
  }
  
  // Determine style description
  let styleDesc = 'professional and formal';
  if (options.style === 'casual') {
    styleDesc = 'conversational and casual';
  } else if (options.style === 'technical') {
    styleDesc = 'technical and detailed';
  }
  
  // Build the system prompt
  let prompt = `You are an expert meeting note-taker. Your task is to create ${detailLevelDesc} meeting notes in a ${styleDesc} style based on the transcript I will provide. The meeting was titled "${meeting.title}"`;
  
  // Add project context if available
  if (meeting.project) {
    prompt += ` and was related to the project "${meeting.project.name}"`;
  }
  
  // Add attendee information if available
  if (meeting.attendees && meeting.attendees.length > 0) {
    const attendeeNames = meeting.attendees.map((a: any) => a.name).join(', ');
    prompt += `. Attendees included: ${attendeeNames}`;
  }
  
  prompt += '.\n\n';
  
  // Add instructions for note format
  prompt += `Format your notes in ${options.format || 'markdown'} format with clear headings and structure.\n`;
  
  // Add instructions for summary
  if (options.includeSummary) {
    prompt += 'Include a concise summary of the key points at the beginning.\n';
  }
  
  // Add instructions for action items
  if (options.includeActionItems) {
    prompt += 'Extract and list all action items mentioned in the meeting, including who is responsible and any deadlines mentioned.\n';
  }
  
  // Add instructions for follow-ups
  if (options.includeFollowUps) {
    prompt += 'Include a section for follow-up items or topics that need further discussion.\n';
  }
  
  // Add instructions for custom sections
  if (options.customSections && options.customSections.length > 0) {
    prompt += `Include the following custom sections: ${options.customSections.join(', ')}.\n`;
  }
  
  // Add instructions for focus areas
  if (options.focusAreas && options.focusAreas.length > 0) {
    prompt += `Focus particularly on these topics: ${options.focusAreas.join(', ')}.\n`;
  }
  
  // Add instructions for excluded topics
  if (options.excludeTopics && options.excludeTopics.length > 0) {
    prompt += `Exclude or minimize coverage of these topics: ${options.excludeTopics.join(', ')}.\n`;
  }
  
  // Add instructions for maximum length
  if (options.maxLength) {
    prompt += `Keep the total length under approximately ${options.maxLength} words.\n`;
  }
  
  // Add final formatting instructions
  prompt += `\nStructure your response as follows:
1. Title: A descriptive title for the meeting notes
2. Summary: A concise summary of the key points (if requested)
3. Main Content: The detailed meeting notes
4. Action Items: List of action items with assignees and deadlines (if requested)
5. Follow-ups: List of topics that need follow-up (if requested)

Make sure your notes are well-organized, clear, and capture the important information from the meeting.`;
  
  return prompt;
}

/**
 * Parses the generated content from the AI
 * @param content Generated content from the AI
 * @returns Parsed title, content, summary, action items, and follow-ups
 */
function parseGeneratedContent(content: string): {
  title: string;
  noteContent: string;
  summary?: string;
  actionItems?: ActionItem[];
  followUps?: FollowUp[];
} {
  // Initialize result
  const result: {
    title: string;
    noteContent: string;
    summary?: string;
    actionItems?: ActionItem[];
    followUps?: FollowUp[];
  } = {
    title: '',
    noteContent: content
  };
  
  try {
    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^Title:\s*(.+)$/m);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }
    
    // Extract summary
    const summaryMatch = content.match(/^##\s+Summary\s*\n([\s\S]*?)(?=\n##|$)/m) || 
                         content.match(/^Summary:\s*\n([\s\S]*?)(?=\n#|$)/m);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }
    
    // Extract action items
    const actionItemsMatch = content.match(/^##\s+Action Items\s*\n([\s\S]*?)(?=\n##|$)/m) || 
                             content.match(/^Action Items:\s*\n([\s\S]*?)(?=\n#|$)/m);
    if (actionItemsMatch) {
      const actionItemsText = actionItemsMatch[1].trim();
      const actionItemLines = actionItemsText.split('\n').filter(line => line.trim().length > 0);
      
      result.actionItems = actionItemLines.map(line => {
        // Remove list markers
        const cleanLine = line.replace(/^[-*]\s+/, '');
        
        // Try to extract assignee
        const assigneeMatch = cleanLine.match(/\(([^)]+)\)/) || cleanLine.match(/@(\w+)/);
        const assignee = assigneeMatch ? assigneeMatch[1].trim() : undefined;
        
        // Try to extract due date
        const dueDateMatch = cleanLine.match(/by\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/) || 
                             cleanLine.match(/due\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/) ||
                             cleanLine.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        const dueDate = dueDateMatch ? new Date(dueDateMatch[1]) : undefined;
        
        // Try to extract priority
        const priorityMatch = cleanLine.match(/\[(high|medium|low)\]/i);
        const priority = priorityMatch ? priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low' : undefined;
        
        // Remove extracted parts from description
        let description = cleanLine
          .replace(/\([^)]+\)/, '')
          .replace(/@\w+/, '')
          .replace(/by\s+\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .replace(/due\s+\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .replace(/\[(high|medium|low)\]/i, '')
          .trim();
        
        return {
          description,
          assignee,
          dueDate,
          priority,
          status: 'pending'
        };
      });
    }
    
    // Extract follow-ups
    const followUpsMatch = content.match(/^##\s+Follow-ups\s*\n([\s\S]*?)(?=\n##|$)/m) || 
                           content.match(/^Follow-ups:\s*\n([\s\S]*?)(?=\n#|$)/m);
    if (followUpsMatch) {
      const followUpsText = followUpsMatch[1].trim();
      const followUpLines = followUpsText.split('\n').filter(line => line.trim().length > 0);
      
      result.followUps = followUpLines.map(line => {
        // Remove list markers
        const cleanLine = line.replace(/^[-*]\s+/, '');
        
        // Try to extract assignee
        const assigneeMatch = cleanLine.match(/\(([^)]+)\)/) || cleanLine.match(/@(\w+)/);
        const assignee = assigneeMatch ? assigneeMatch[1].trim() : undefined;
        
        // Try to extract due date
        const dueDateMatch = cleanLine.match(/by\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/) || 
                             cleanLine.match(/due\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/) ||
                             cleanLine.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        const dueDate = dueDateMatch ? new Date(dueDateMatch[1]) : undefined;
        
        // Remove extracted parts from description
        let description = cleanLine
          .replace(/\([^)]+\)/, '')
          .replace(/@\w+/, '')
          .replace(/by\s+\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .replace(/due\s+\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/, '')
          .trim();
        
        return {
          description,
          assignee,
          dueDate
        };
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing generated content:', error);
    return {
      title: 'Meeting Notes',
      noteContent: content
    };
  }
}

/**
 * Applies a template to the generated note
 * @param note Generated note
 * @param template Template to apply
 * @returns Formatted note
 */
function applyTemplate(note: GeneratedNote, template: any): GeneratedNote {
  try {
    // Clone the note to avoid modifying the original
    const formattedNote = { ...note };
    
    // Get template content
    const templateContent = template.content;
    
    // Replace template variables with note content
    let content = templateContent
      .replace(/{{title}}/g, note.title)
      .replace(/{{content}}/g, note.content)
      .replace(/{{date}}/g, new Date().toLocaleDateString())
      .replace(/{{time}}/g, new Date().toLocaleTimeString());
    
    // Replace summary if available
    if (note.summary) {
      content = content.replace(/{{summary}}/g, note.summary);
    } else {
      content = content.replace(/{{summary}}/g, '');
    }
    
    // Replace action items if available
    if (note.actionItems && note.actionItems.length > 0) {
      const actionItemsText = note.actionItems.map(item => {
        let text = `- ${item.description}`;
        if (item.assignee) {
          text += ` (${item.assignee})`;
        }
        if (item.dueDate) {
          text += ` by ${item.dueDate.toLocaleDateString()}`;
        }
        if (item.priority) {
          text += ` [${item.priority}]`;
        }
        return text;
      }).join('\n');
      
      content = content.replace(/{{actionItems}}/g, actionItemsText);
    } else {
      content = content.replace(/{{actionItems}}/g, '');
    }
    
    // Replace follow-ups if available
    if (note.followUps && note.followUps.length > 0) {
      const followUpsText = note.followUps.map(item => {
        let text = `- ${item.description}`;
        if (item.assignee) {
          text += ` (${item.assignee})`;
        }
        if (item.dueDate) {
          text += ` by ${item.dueDate.toLocaleDateString()}`;
        }
        return text;
      }).join('\n');
      
      content = content.replace(/{{followUps}}/g, followUpsText);
    } else {
      content = content.replace(/{{followUps}}/g, '');
    }
    
    // Update the note content
    formattedNote.content = content;
    
    return formattedNote;
  } catch (error) {
    console.error('Error applying template:', error);
    return note;
  }
}
