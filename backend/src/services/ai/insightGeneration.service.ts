import { OpenAI } from 'openai';
import { 
  InsightGenerationOptions, 
  GeneratedInsight,
  PersonInsight,
  ProjectInsight,
  MeetingInsight
} from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Generates insights for a specific person
 * @param personId ID of the person to generate insights for
 * @param options Options for insight generation
 * @returns Generated insights for the person
 */
export async function generatePersonInsights(
  personId: string,
  options: InsightGenerationOptions
): Promise<PersonInsight> {
  try {
    // Fetch person data
    const person = await fetchPersonData(personId);
    
    if (!person) {
      throw new Error(`Person with ID ${personId} not found`);
    }
    
    // Fetch related meetings
    const meetings = await fetchPersonMeetings(personId, options.timeframe);
    
    // Generate system prompt
    const systemPrompt = generatePersonInsightPrompt(options);
    
    // Generate user prompt with person and meeting data
    const userPrompt = generatePersonDataPrompt(person, meetings);
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseGeneratedInsights(content);
    
    // Generate a summary of the person's participation and contributions
    const summary = generatePersonSummary(person, meetings, insights);
    
    return {
      personId,
      personName: person.name,
      insights
    };
  } catch (error) {
    console.error('Error generating person insights:', error);
    throw new Error('Failed to generate person insights');
  }
}

/**
 * Generates insights for a specific project
 * @param projectId ID of the project to generate insights for
 * @param options Options for insight generation
 * @returns Generated insights for the project
 */
export async function generateProjectInsights(
  projectId: string,
  options: InsightGenerationOptions
): Promise<ProjectInsight> {
  try {
    // Fetch project data
    const project = await fetchProjectData(projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Fetch related meetings
    const meetings = await fetchProjectMeetings(projectId, options.timeframe);
    
    // Generate system prompt
    const systemPrompt = generateProjectInsightPrompt(options);
    
    // Generate user prompt with project and meeting data
    const userPrompt = generateProjectDataPrompt(project, meetings);
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseGeneratedInsights(content);
    
    // Generate a status summary for the project
    const statusSummary = generateProjectStatusSummary(project, meetings, insights);
    
    return {
      projectId,
      projectName: project.name,
      insights
    };
  } catch (error) {
    console.error('Error generating project insights:', error);
    throw new Error('Failed to generate project insights');
  }
}

/**
 * Generates insights for a specific meeting
 * @param meetingId ID of the meeting to generate insights for
 * @param options Options for insight generation
 * @returns Generated insights for the meeting
 */
export async function generateMeetingInsights(
  meetingId: string,
  options: InsightGenerationOptions
): Promise<MeetingInsight> {
  try {
    // Fetch meeting data
    const meeting = await fetchMeetingData(meetingId);
    
    if (!meeting) {
      throw new Error(`Meeting with ID ${meetingId} not found`);
    }
    
    // Fetch transcript
    const transcript = await fetchMeetingTranscript(meetingId);
    
    if (!transcript) {
      throw new Error(`Transcript for meeting with ID ${meetingId} not found`);
    }
    
    // Generate system prompt
    const systemPrompt = generateMeetingInsightPrompt(options);
    
    // Generate user prompt with meeting and transcript data
    const userPrompt = generateMeetingDataPrompt(meeting, transcript);
    
    // Call OpenAI API to generate insights
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract insights from the generated content
    const insights = parseGeneratedInsights(content);
    
    // Generate an assessment of the meeting
    const assessment = generateMeetingAssessment(meeting, transcript, insights);
    
    return {
      meetingId,
      meetingTitle: meeting.title,
      insights
    };
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    throw new Error('Failed to generate meeting insights');
  }
}

/**
 * Fetches person data from the database
 * @param personId ID of the person to fetch
 * @returns Person object or null if not found
 */
async function fetchPersonData(personId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock person
  return {
    id: personId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Software Engineer',
    organization: 'Acme Inc.',
    projects: ['project-1', 'project-2'],
    tags: ['engineering', 'frontend'],
    notes: 'Experienced frontend developer',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Fetches meetings related to a person
 * @param personId ID of the person
 * @param timeframe Optional timeframe to filter meetings
 * @returns Array of meeting objects
 */
async function fetchPersonMeetings(personId: string, timeframe?: { start: Date; end: Date }): Promise<any[]> {
  // This would be replaced with actual database query
  // For now, return mock meetings
  return [
    {
      id: 'meeting-1',
      title: 'Weekly Team Sync',
      description: 'Regular team sync meeting',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z'),
      participants: [personId, 'person-2', 'person-3'],
      projectId: 'project-1',
      status: 'completed',
      createdBy: 'user-1',
      createdAt: new Date('2022-12-30'),
      updatedAt: new Date('2022-12-30')
    },
    {
      id: 'meeting-2',
      title: 'Project Planning',
      description: 'Planning session for new project',
      startTime: new Date('2023-01-03T14:00:00Z'),
      endTime: new Date('2023-01-03T15:30:00Z'),
      participants: [personId, 'person-4', 'person-5'],
      projectId: 'project-2',
      status: 'completed',
      createdBy: 'user-1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    }
  ];
}

/**
 * Fetches project data from the database
 * @param projectId ID of the project to fetch
 * @returns Project object or null if not found
 */
async function fetchProjectData(projectId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock project
  return {
    id: projectId,
    name: 'Website Redesign',
    description: 'Redesign of the company website',
    status: 'active',
    members: ['person-1', 'person-2', 'person-3'],
    tags: ['design', 'frontend', 'marketing'],
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-03-31'),
    createdBy: 'user-1',
    createdAt: new Date('2022-12-15'),
    updatedAt: new Date('2022-12-15')
  };
}

/**
 * Fetches meetings related to a project
 * @param projectId ID of the project
 * @param timeframe Optional timeframe to filter meetings
 * @returns Array of meeting objects
 */
async function fetchProjectMeetings(projectId: string, timeframe?: { start: Date; end: Date }): Promise<any[]> {
  // This would be replaced with actual database query
  // For now, return mock meetings
  return [
    {
      id: 'meeting-1',
      title: 'Project Kickoff',
      description: 'Initial kickoff meeting for the project',
      startTime: new Date('2023-01-02T10:00:00Z'),
      endTime: new Date('2023-01-02T11:30:00Z'),
      participants: ['person-1', 'person-2', 'person-3'],
      projectId,
      status: 'completed',
      createdBy: 'user-1',
      createdAt: new Date('2022-12-30'),
      updatedAt: new Date('2022-12-30')
    },
    {
      id: 'meeting-2',
      title: 'Design Review',
      description: 'Review of initial design concepts',
      startTime: new Date('2023-01-10T14:00:00Z'),
      endTime: new Date('2023-01-10T15:00:00Z'),
      participants: ['person-1', 'person-4', 'person-5'],
      projectId,
      status: 'completed',
      createdBy: 'user-1',
      createdAt: new Date('2023-01-08'),
      updatedAt: new Date('2023-01-08')
    }
  ];
}

/**
 * Fetches meeting data from the database
 * @param meetingId ID of the meeting to fetch
 * @returns Meeting object or null if not found
 */
async function fetchMeetingData(meetingId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock meeting
  return {
    id: meetingId,
    title: 'Product Strategy Discussion',
    description: 'Discussion about product roadmap and strategy',
    startTime: new Date('2023-01-15T13:00:00Z'),
    endTime: new Date('2023-01-15T14:30:00Z'),
    participants: ['person-1', 'person-2', 'person-3'],
    projectId: 'project-1',
    status: 'completed',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-10')
  };
}

/**
 * Fetches transcript for a meeting
 * @param meetingId ID of the meeting
 * @returns Transcript object or null if not found
 */
async function fetchMeetingTranscript(meetingId: string): Promise<any> {
  // This would be replaced with actual database query
  // For now, return a mock transcript
  return {
    id: 'transcript-1',
    meetingId,
    content: 'This is a sample transcript content.',
    segments: [
      {
        speakerId: 'person-1',
        speakerName: 'John Doe',
        text: 'Let\'s discuss the product roadmap for Q1.',
        startTime: 0,
        endTime: 5
      },
      {
        speakerId: 'person-2',
        speakerName: 'Jane Smith',
        text: 'I think we should prioritize the new user onboarding flow.',
        startTime: 6,
        endTime: 10
      },
      {
        speakerId: 'person-3',
        speakerName: 'Bob Johnson',
        text: 'I agree, and we should also consider improving the analytics dashboard.',
        startTime: 11,
        endTime: 15
      }
    ],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  };
}

/**
 * Generates a system prompt for person insights
 * @param options Options for insight generation
 * @returns System prompt for the AI
 */
function generatePersonInsightPrompt(options: InsightGenerationOptions): string {
  let detailLevel = '';
  switch (options.depth) {
    case 'basic':
      detailLevel = 'basic';
      break;
    case 'detailed':
      detailLevel = 'detailed';
      break;
    case 'comprehensive':
      detailLevel = 'comprehensive';
      break;
    default:
      detailLevel = 'detailed';
  }
  
  return `You are an expert at analyzing meeting data and generating insights about people. Your task is to provide ${detailLevel} insights about a person based on their participation in meetings. Focus on identifying patterns, contributions, areas of expertise, and potential growth opportunities. Format your response as a structured JSON with the following sections:
  
1. "insights": An array of insight objects, each containing:
   - "title": A concise title for the insight
   - "description": A detailed description of the insight
   - "type": The type of insight (trend, connection, recommendation, risk, opportunity)
   - "confidence": A number between 0 and 100 indicating your confidence in this insight
   - "supportingEvidence": Array of evidence that supports this insight, with source references

2. "summary": A brief summary of the person's participation and contributions

Be specific, data-driven, and actionable in your insights.`;
}

/**
 * Generates a system prompt for project insights
 * @param options Options for insight generation
 * @returns System prompt for the AI
 */
function generateProjectInsightPrompt(options: InsightGenerationOptions): string {
  let detailLevel = '';
  switch (options.depth) {
    case 'basic':
      detailLevel = 'basic';
      break;
    case 'detailed':
      detailLevel = 'detailed';
      break;
    case 'comprehensive':
      detailLevel = 'comprehensive';
      break;
    default:
      detailLevel = 'detailed';
  }
  
  return `You are an expert at analyzing meeting data and generating insights about projects. Your task is to provide ${detailLevel} insights about a project based on related meetings. Focus on identifying progress, blockers, risks, decisions made, and action items. Format your response as a structured JSON with the following sections:
  
1. "insights": An array of insight objects, each containing:
   - "title": A concise title for the insight
   - "description": A detailed description of the insight
   - "type": The type of insight (trend, connection, recommendation, risk, opportunity)
   - "confidence": A number between 0 and 100 indicating your confidence in this insight
   - "supportingEvidence": Array of evidence that supports this insight, with source references

2. "statusSummary": A brief summary of the project's current status

Be specific, data-driven, and actionable in your insights.`;
}

/**
 * Generates a system prompt for meeting insights
 * @param options Options for insight generation
 * @returns System prompt for the AI
 */
function generateMeetingInsightPrompt(options: InsightGenerationOptions): string {
  let detailLevel = '';
  switch (options.depth) {
    case 'basic':
      detailLevel = 'basic';
      break;
    case 'detailed':
      detailLevel = 'detailed';
      break;
    case 'comprehensive':
      detailLevel = 'comprehensive';
      break;
    default:
      detailLevel = 'detailed';
  }
  
  return `You are an expert at analyzing meeting transcripts and generating insights. Your task is to provide ${detailLevel} insights about a meeting based on its transcript. Focus on identifying key topics discussed, decisions made, action items, and participant dynamics. Format your response as a structured JSON with the following sections:
  
1. "insights": An array of insight objects, each containing:
   - "title": A concise title for the insight
   - "description": A detailed description of the insight
   - "type": The type of insight (trend, connection, recommendation, risk, opportunity)
   - "confidence": A number between 0 and 100 indicating your confidence in this insight
   - "supportingEvidence": Array of evidence that supports this insight, with source references

2. "assessment": A brief assessment of the meeting's effectiveness and outcomes

Be specific, data-driven, and actionable in your insights.`;
}

/**
 * Generates a user prompt with person and meeting data
 * @param person Person object
 * @param meetings Array of meeting objects
 * @returns User prompt for the AI
 */
function generatePersonDataPrompt(person: any, meetings: any[]): string {
  let userPrompt = `Person Information:\n`;
  userPrompt += `Name: ${person.name}\n`;
  userPrompt += `Role: ${person.role}\n`;
  userPrompt += `Organization: ${person.organization}\n`;
  userPrompt += `Tags: ${person.tags.join(', ')}\n\n`;
  
  userPrompt += `Meeting Participation:\n`;
  
  meetings.forEach((meeting, index) => {
    userPrompt += `Meeting ${index + 1}: ${meeting.title}\n`;
    userPrompt += `Date: ${meeting.startTime.toISOString()}\n`;
    userPrompt += `Description: ${meeting.description}\n`;
    userPrompt += `Project: ${meeting.projectId}\n\n`;
  });
  
  return userPrompt;
}

/**
 * Generates a user prompt with project and meeting data
 * @param project Project object
 * @param meetings Array of meeting objects
 * @returns User prompt for the AI
 */
function generateProjectDataPrompt(project: any, meetings: any[]): string {
  let userPrompt = `Project Information:\n`;
  userPrompt += `Name: ${project.name}\n`;
  userPrompt += `Description: ${project.description}\n`;
  userPrompt += `Status: ${project.status}\n`;
  userPrompt += `Start Date: ${project.startDate.toISOString()}\n`;
  userPrompt += `End Date: ${project.endDate ? project.endDate.toISOString() : 'Not set'}\n`;
  userPrompt += `Tags: ${project.tags.join(', ')}\n\n`;
  
  userPrompt += `Project Meetings:\n`;
  
  meetings.forEach((meeting, index) => {
    userPrompt += `Meeting ${index + 1}: ${meeting.title}\n`;
    userPrompt += `Date: ${meeting.startTime.toISOString()}\n`;
    userPrompt += `Description: ${meeting.description}\n`;
    userPrompt += `Participants: ${meeting.participants.length} people\n\n`;
  });
  
  return userPrompt;
}

/**
 * Generates a user prompt with meeting and transcript data
 * @param meeting Meeting object
 * @param transcript Transcript object
 * @returns User prompt for the AI
 */
function generateMeetingDataPrompt(meeting: any, transcript: any): string {
  let userPrompt = `Meeting Information:\n`;
  userPrompt += `Title: ${meeting.title}\n`;
  userPrompt += `Description: ${meeting.description}\n`;
  userPrompt += `Date: ${meeting.startTime.toISOString()}\n`;
  userPrompt += `Duration: ${(meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)} minutes\n`;
  userPrompt += `Participants: ${meeting.participants.length} people\n\n`;
  
  userPrompt += `Meeting Transcript:\n`;
  
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
 * Parses the generated content into insights
 * @param content Generated content from the AI
 * @returns Array of parsed insights
 */
function parseGeneratedInsights(content: string): GeneratedInsight[] {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent.insights)) {
      return parsedContent.insights.map((insight: any) => ({
        id: `insight-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: insight.title,
        description: insight.description,
        type: insight.type,
        confidence: insight.confidence,
        relatedEntities: insight.relatedEntities || [],
        supportingEvidence: insight.supportingEvidence || [],
        createdAt: new Date()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing generated insights:', error);
    
    // If JSON parsing fails, try to extract insights manually
    const insights: GeneratedInsight[] = [];
    
    // Simple regex-based extraction (this is a fallback and not ideal)
    const insightMatches = content.match(/##\s+(.+?)\n([\s\S]*?)(?=##|$)/g);
    
    if (insightMatches) {
      insightMatches.forEach((match, index) => {
        const titleMatch = match.match(/##\s+(.+)/);
        const title = titleMatch ? titleMatch[1] : `Insight ${index + 1}`;
        
        insights.push({
          id: `insight-${Date.now()}-${index}`,
          title,
          description: match.replace(/##\s+.+\n/, '').trim(),
          type: 'recommendation',
          confidence: 70,
          relatedEntities: [],
          supportingEvidence: [],
          createdAt: new Date()
        });
      });
    }
    
    return insights;
  }
}

/**
 * Generates a summary of a person's participation and contributions
 * @param person Person object
 * @param meetings Array of meeting objects
 * @param insights Array of generated insights
 * @returns Summary text
 */
function generatePersonSummary(person: any, meetings: any[], insights: GeneratedInsight[]): string {
  // This would be a more sophisticated function in a real implementation
  // For now, return a simple summary
  return `${person.name} has participated in ${meetings.length} meetings. Based on the analysis, they have shown expertise in their role as ${person.role} and have contributed valuable insights related to ${person.tags.join(', ')}.`;
}

/**
 * Generates a status summary for a project
 * @param project Project object
 * @param meetings Array of meeting objects
 * @param insights Array of generated insights
 * @returns Status summary text
 */
function generateProjectStatusSummary(project: any, meetings: any[], insights: GeneratedInsight[]): string {
  // This would be a more sophisticated function in a real implementation
  // For now, return a simple summary
  return `The ${project.name} project is currently ${project.status}. There have been ${meetings.length} meetings related to this project. The project is focused on ${project.tags.join(', ')} and involves ${project.members.length} team members.`;
}

/**
 * Generates an assessment of a meeting
 * @param meeting Meeting object
 * @param transcript Transcript object
 * @param insights Array of generated insights
 * @returns Assessment text
 */
function generateMeetingAssessment(meeting: any, transcript: any, insights: GeneratedInsight[]): string {
  // This would be a more sophisticated function in a real implementation
  // For now, return a simple assessment
  return `The ${meeting.title} meeting lasted ${(meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)} minutes and involved ${meeting.participants.length} participants. The discussion was focused on the meeting's stated purpose and resulted in several actionable insights.`;
}
