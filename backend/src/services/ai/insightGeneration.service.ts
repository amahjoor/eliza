import { OpenAI } from 'openai';
import { 
  InsightGenerationOptions, 
  PersonInsight, 
  ProjectInsight, 
  MeetingInsight,
  Insight
} from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Generates insights about a person based on their meeting participation
 * @param personId ID of the person
 * @param options Options for insight generation
 * @returns Generated insights about the person
 */
export async function generatePersonInsights(
  personId: string,
  options: InsightGenerationOptions = {}
): Promise<PersonInsight> {
  try {
    // Set default options
    const defaultOptions: InsightGenerationOptions = {
      depth: 'detailed'
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // In a real implementation, we would fetch person data from the database
    // For now, we'll use mock data
    const person = {
      id: personId,
      name: 'Alice Smith',
      role: 'Frontend Developer',
      meetings: [
        { 
          id: 'meeting-1',
          title: 'Project Planning Meeting',
          date: new Date('2023-01-15')
        },
        { 
          id: 'meeting-2',
          title: 'Frontend Architecture Discussion',
          date: new Date('2023-01-20')
        }
      ]
    };
    
    // Generate system prompt
    const systemPrompt = generatePersonInsightPrompt(person, mergedOptions);
    
    // Generate user prompt with person data
    const userPrompt = `Please analyze the following data about ${person.name} and generate insights:

Role: ${person.role}
Meetings attended: ${person.meetings.length}
Recent meeting topics: ${person.meetings.map(m => m.title).join(', ')}`;
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseInsights(content);
    
    // Create the person insight object
    const personInsight: PersonInsight = {
      personId,
      insights,
      metadata: {
        generatedAt: new Date(),
        options: mergedOptions
      }
    };
    
    return personInsight;
  } catch (error) {
    console.error('Error generating person insights:', error);
    throw new Error('Failed to generate person insights');
  }
}

/**
 * Generates insights about a project based on related meetings
 * @param projectId ID of the project
 * @param options Options for insight generation
 * @returns Generated insights about the project
 */
export async function generateProjectInsights(
  projectId: string,
  options: InsightGenerationOptions = {}
): Promise<ProjectInsight> {
  try {
    // Set default options
    const defaultOptions: InsightGenerationOptions = {
      depth: 'detailed'
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // In a real implementation, we would fetch project data from the database
    // For now, we'll use mock data
    const project = {
      id: projectId,
      name: 'Eliza AI Assistant',
      description: 'An AI-powered meeting assistant that helps with note-taking and knowledge management',
      meetings: [
        { 
          id: 'meeting-1',
          title: 'Project Planning Meeting',
          date: new Date('2023-01-15')
        },
        { 
          id: 'meeting-2',
          title: 'Frontend Architecture Discussion',
          date: new Date('2023-01-20')
        },
        { 
          id: 'meeting-3',
          title: 'Backend API Design',
          date: new Date('2023-01-25')
        }
      ]
    };
    
    // Generate system prompt
    const systemPrompt = generateProjectInsightPrompt(project, mergedOptions);
    
    // Generate user prompt with project data
    const userPrompt = `Please analyze the following data about the project "${project.name}" and generate insights:

Project description: ${project.description}
Number of meetings: ${project.meetings.length}
Recent meeting topics: ${project.meetings.map(m => m.title).join(', ')}`;
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseInsights(content);
    
    // Create the project insight object
    const projectInsight: ProjectInsight = {
      projectId,
      insights,
      metadata: {
        generatedAt: new Date(),
        options: mergedOptions
      }
    };
    
    return projectInsight;
  } catch (error) {
    console.error('Error generating project insights:', error);
    throw new Error('Failed to generate project insights');
  }
}

/**
 * Generates insights about a meeting based on its transcript and notes
 * @param meetingId ID of the meeting
 * @param options Options for insight generation
 * @returns Generated insights about the meeting
 */
export async function generateMeetingInsights(
  meetingId: string,
  options: InsightGenerationOptions = {}
): Promise<MeetingInsight> {
  try {
    // Set default options
    const defaultOptions: InsightGenerationOptions = {
      depth: 'detailed'
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // In a real implementation, we would fetch meeting data from the database
    // For now, we'll use mock data
    const meeting = {
      id: meetingId,
      title: 'Project Planning Meeting',
      description: 'Discussion about project timeline and resource allocation',
      transcript: 'This is a sample transcript content for testing purposes. ' +
                 'The team discussed project timelines and resource allocation. ' +
                 'Alice will handle the frontend development, and Bob will work on the backend. ' +
                 'We need to complete the initial prototype by next Friday.',
      attendees: [
        { name: 'Alice Smith', role: 'Frontend Developer' },
        { name: 'Bob Johnson', role: 'Backend Developer' },
        { name: 'Charlie Brown', role: 'Project Manager' }
      ],
      project: { name: 'Eliza AI Assistant' }
    };
    
    // Generate system prompt
    const systemPrompt = generateMeetingInsightPrompt(meeting, mergedOptions);
    
    // Generate user prompt with meeting data
    const userPrompt = `Please analyze the following meeting data and generate insights:

Meeting title: ${meeting.title}
Meeting description: ${meeting.description}
Project: ${meeting.project.name}
Attendees: ${meeting.attendees.map(a => a.name).join(', ')}

Transcript:
${meeting.transcript}`;
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseInsights(content);
    
    // Create the meeting insight object
    const meetingInsight: MeetingInsight = {
      meetingId,
      insights,
      metadata: {
        generatedAt: new Date(),
        options: mergedOptions
      }
    };
    
    return meetingInsight;
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    throw new Error('Failed to generate meeting insights');
  }
}

/**
 * Generates a system prompt for person insights
 * @param person Person data
 * @param options Insight generation options
 * @returns System prompt for the AI
 */
function generatePersonInsightPrompt(person: any, options: InsightGenerationOptions): string {
  // Determine depth description
  let depthDesc = 'detailed';
  if (options.depth === 'concise') {
    depthDesc = 'concise';
  } else if (options.depth === 'comprehensive') {
    depthDesc = 'comprehensive';
  }
  
  // Build the system prompt
  let prompt = `You are an expert at analyzing meeting data and generating insights about people. Your task is to create ${depthDesc} insights about ${person.name} based on their meeting participation and contributions.

For each insight, provide:
1. A clear title
2. The type of insight (observation, trend, recommendation, risk, opportunity)
3. A detailed description
4. A confidence score (0-100)
5. Supporting evidence
6. Relevant tags

Format your response as a JSON array of insights. Focus on providing actionable, valuable insights that would help understand ${person.name}'s role, contributions, and potential areas for growth or recognition.`;
  
  // Add instructions for focus areas if provided
  if (options.focusAreas && options.focusAreas.length > 0) {
    prompt += `\n\nFocus particularly on these areas: ${options.focusAreas.join(', ')}.`;
  }
  
  // Add instructions for timeframe if provided
  if (options.timeframe) {
    const startDate = options.timeframe.startDate ? options.timeframe.startDate.toISOString().split('T')[0] : 'any time';
    const endDate = options.timeframe.endDate ? options.timeframe.endDate.toISOString().split('T')[0] : 'present';
    prompt += `\n\nFocus on the timeframe from ${startDate} to ${endDate}.`;
  }
  
  return prompt;
}

/**
 * Generates a system prompt for project insights
 * @param project Project data
 * @param options Insight generation options
 * @returns System prompt for the AI
 */
function generateProjectInsightPrompt(project: any, options: InsightGenerationOptions): string {
  // Determine depth description
  let depthDesc = 'detailed';
  if (options.depth === 'concise') {
    depthDesc = 'concise';
  } else if (options.depth === 'comprehensive') {
    depthDesc = 'comprehensive';
  }
  
  // Build the system prompt
  let prompt = `You are an expert at analyzing meeting data and generating insights about projects. Your task is to create ${depthDesc} insights about the project "${project.name}" based on related meetings and discussions.

For each insight, provide:
1. A clear title
2. The type of insight (observation, trend, recommendation, risk, opportunity)
3. A detailed description
4. A confidence score (0-100)
5. Supporting evidence
6. Relevant tags

Format your response as a JSON array of insights. Focus on providing actionable, valuable insights that would help understand the project's progress, challenges, and opportunities.`;
  
  // Add instructions for focus areas if provided
  if (options.focusAreas && options.focusAreas.length > 0) {
    prompt += `\n\nFocus particularly on these areas: ${options.focusAreas.join(', ')}.`;
  }
  
  // Add instructions for timeframe if provided
  if (options.timeframe) {
    const startDate = options.timeframe.startDate ? options.timeframe.startDate.toISOString().split('T')[0] : 'any time';
    const endDate = options.timeframe.endDate ? options.timeframe.endDate.toISOString().split('T')[0] : 'present';
    prompt += `\n\nFocus on the timeframe from ${startDate} to ${endDate}.`;
  }
  
  return prompt;
}

/**
 * Generates a system prompt for meeting insights
 * @param meeting Meeting data
 * @param options Insight generation options
 * @returns System prompt for the AI
 */
function generateMeetingInsightPrompt(meeting: any, options: InsightGenerationOptions): string {
  // Determine depth description
  let depthDesc = 'detailed';
  if (options.depth === 'concise') {
    depthDesc = 'concise';
  } else if (options.depth === 'comprehensive') {
    depthDesc = 'comprehensive';
  }
  
  // Build the system prompt
  let prompt = `You are an expert at analyzing meeting transcripts and generating insights. Your task is to create ${depthDesc} insights about the meeting titled "${meeting.title}" based on the transcript I will provide.

For each insight, provide:
1. A clear title
2. The type of insight (observation, trend, recommendation, risk, opportunity)
3. A detailed description
4. A confidence score (0-100)
5. Supporting evidence
6. Relevant tags

Format your response as a JSON array of insights. Focus on providing actionable, valuable insights that would help understand the key points, decisions, action items, and underlying themes of the meeting.`;
  
  // Add instructions for focus areas if provided
  if (options.focusAreas && options.focusAreas.length > 0) {
    prompt += `\n\nFocus particularly on these areas: ${options.focusAreas.join(', ')}.`;
  }
  
  return prompt;
}

/**
 * Parses insights from the generated content
 * @param content Generated content from the AI
 * @returns Array of parsed insights
 */
function parseInsights(content: string): Insight[] {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent)) {
      return parsedContent.map(item => ({
        type: item.type as 'observation' | 'trend' | 'recommendation' | 'risk' | 'opportunity',
        title: item.title,
        description: item.description,
        confidence: item.confidence,
        evidence: Array.isArray(item.evidence) ? item.evidence : [item.evidence],
        tags: item.tags,
        relatedEntities: item.relatedEntities
      }));
    }
    
    // If the content is not an array, try to extract insights from the text
    return extractInsightsFromText(content);
  } catch (error) {
    console.error('Error parsing insights:', error);
    
    // If JSON parsing fails, try to extract insights from the text
    return extractInsightsFromText(content);
  }
}

/**
 * Extracts insights from text when JSON parsing fails
 * @param content Text content
 * @returns Array of extracted insights
 */
function extractInsightsFromText(content: string): Insight[] {
  const insights: Insight[] = [];
  
  // Try to extract insights using regex patterns
  const insightBlocks = content.split(/(?=##\s+Insight|#\s+Insight|\d+\.\s+Insight)/);
  
  for (const block of insightBlocks) {
    if (!block.trim()) continue;
    
    // Extract title
    const titleMatch = block.match(/(?:##\s+|#\s+|\d+\.\s+)?(?:Insight:?\s+)?(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Insight';
    
    // Extract type
    const typeMatch = block.match(/Type:?\s+(\w+)/i);
    const type = typeMatch ? 
      typeMatch[1].toLowerCase() as 'observation' | 'trend' | 'recommendation' | 'risk' | 'opportunity' : 
      'observation';
    
    // Extract description
    const descriptionMatch = block.match(/Description:?\s+(.+?)(?=\n\s*(?:Confidence|Evidence|Tags|$))/is);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Extract confidence
    const confidenceMatch = block.match(/Confidence:?\s+(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
    
    // Extract evidence
    const evidenceMatch = block.match(/Evidence:?\s+(.+?)(?=\n\s*(?:Tags|$))/is);
    const evidence = evidenceMatch ? 
      evidenceMatch[1].split(/\n\s*[-*]\s+/).filter(e => e.trim()) : 
      ['Based on meeting transcript'];
    
    // Extract tags
    const tagsMatch = block.match(/Tags:?\s+(.+?)(?=\n|$)/i);
    const tags = tagsMatch ? 
      tagsMatch[1].split(/,\s*/).map(tag => tag.trim()) : 
      [];
    
    insights.push({
      type,
      title,
      description,
      confidence,
      evidence,
      tags
    });
  }
  
  // If no insights were extracted, create a default one
  if (insights.length === 0) {
    insights.push({
      type: 'observation',
      title: 'General Meeting Insight',
      description: 'This is an automatically generated insight based on the meeting transcript.',
      confidence: 70,
      evidence: ['Based on meeting transcript'],
      tags: ['meeting', 'general']
    });
  }
  
  return insights;
}
