import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate insights about a person based on their meeting history
 */
export const generatePersonInsights = async (
  personId: string,
  personName: string,
  meetingHistory: any[],
  transcriptExcerpts: string[]
): Promise<any> => {
  try {
    // Prepare meeting history data
    const meetingData = meetingHistory.map(meeting => ({
      title: meeting.title,
      date: meeting.date,
      role: meeting.role || 'Participant',
      contributions: meeting.contributions || []
    }));
    
    // Prepare system prompt for insight generation
    const systemPrompt = `You are an AI assistant that generates professional insights about people based on their meeting history.
    Analyze the provided meeting history and transcript excerpts to generate insights about ${personName}.
    Focus on:
    1. Communication style and patterns
    2. Areas of expertise and knowledge
    3. Collaboration patterns and relationships
    4. Decision-making approach
    5. Contribution patterns and impact
    
    Provide a concise summary of the person's professional profile based on the data.
    Also generate a "networkConnectivity" score (1-100) that represents how connected this person is within the organization.
    Finally, identify key topics and areas where this person has demonstrated expertise or interest.
    
    Be objective, professional, and focus only on work-related insights that would be valuable for collaboration.`;

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Person: ${personName} (ID: ${personId})\n\nMeeting History:\n${JSON.stringify(meetingData, null, 2)}\n\nTranscript Excerpts:\n${transcriptExcerpts.join('\n\n')}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';
    
    // Parse insights from AI response
    return parsePersonInsights(aiContent, personId, personName);
  } catch (error) {
    console.error('Error generating person insights:', error);
    throw error;
  }
};

/**
 * Parse person insights from AI-generated content
 */
const parsePersonInsights = (content: string, personId: string, personName: string): any => {
  // Extract summary
  const summaryMatch = content.match(/Summary:([\s\S]*?)(?=Network Connectivity:|Areas of Expertise:|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  
  // Extract network connectivity score
  const connectivityMatch = content.match(/Network Connectivity:.*?(\d+)/i);
  const networkConnectivity = connectivityMatch ? parseInt(connectivityMatch[1], 10) : 50;
  
  // Extract areas of expertise
  const expertiseMatch = content.match(/Areas of Expertise:([\s\S]*?)(?=$)/i);
  const expertiseText = expertiseMatch ? expertiseMatch[1].trim() : '';
  
  // Parse expertise into array
  const expertiseAreas = expertiseText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(area => area.length > 0);
  
  return {
    personId,
    personName,
    summary,
    networkConnectivity,
    expertiseAreas,
    generatedAt: new Date().toISOString(),
    aiGenerated: true
  };
};

/**
 * Generate project insights based on related meetings and people
 */
export const generateProjectInsights = async (
  projectId: string,
  projectName: string,
  projectDescription: string,
  relatedMeetings: any[],
  teamMembers: any[]
): Promise<any> => {
  try {
    // Prepare meeting data
    const meetingData = relatedMeetings.map(meeting => ({
      title: meeting.title,
      date: meeting.date,
      summary: meeting.summary || '',
      actionItems: meeting.actionItems || []
    }));
    
    // Prepare team member data
    const teamData = teamMembers.map(member => ({
      name: member.name,
      role: member.role || 'Team Member',
      expertise: member.expertiseAreas || []
    }));
    
    // Prepare system prompt for project insight generation
    const systemPrompt = `You are an AI assistant that generates insights about projects based on related meetings and team members.
    Analyze the provided project information, related meetings, and team composition to generate insights about the project.
    Focus on:
    1. Project progress and status
    2. Key milestones and achievements
    3. Challenges and blockers
    4. Team dynamics and collaboration
    5. Decision patterns and project direction
    
    Provide a concise summary of the project's current status.
    Calculate a "progressScore" (1-100) that represents the project's progress toward completion.
    Identify key risks and opportunities for the project.
    Suggest next steps or recommendations for project success.
    
    Be objective, professional, and focus on actionable insights that would be valuable for project management.`;

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Project: ${projectName} (ID: ${projectId})\nDescription: ${projectDescription}\n\nRelated Meetings:\n${JSON.stringify(meetingData, null, 2)}\n\nTeam Members:\n${JSON.stringify(teamData, null, 2)}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';
    
    // Parse insights from AI response
    return parseProjectInsights(aiContent, projectId, projectName);
  } catch (error) {
    console.error('Error generating project insights:', error);
    throw error;
  }
};

/**
 * Parse project insights from AI-generated content
 */
const parseProjectInsights = (content: string, projectId: string, projectName: string): any => {
  // Extract status summary
  const summaryMatch = content.match(/Status Summary:([\s\S]*?)(?=Progress Score:|Key Risks:|Next Steps:|$)/i);
  const statusSummary = summaryMatch ? summaryMatch[1].trim() : '';
  
  // Extract progress score
  const progressMatch = content.match(/Progress Score:.*?(\d+)/i);
  const progressScore = progressMatch ? parseInt(progressMatch[1], 10) : 0;
  
  // Extract key risks
  const risksMatch = content.match(/Key Risks:([\s\S]*?)(?=Next Steps:|Recommendations:|$)/i);
  const risksText = risksMatch ? risksMatch[1].trim() : '';
  
  // Parse risks into array
  const keyRisks = risksText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(risk => risk.length > 0);
  
  // Extract next steps/recommendations
  const nextStepsMatch = content.match(/(?:Next Steps|Recommendations):([\s\S]*?)(?=$)/i);
  const nextStepsText = nextStepsMatch ? nextStepsMatch[1].trim() : '';
  
  // Parse next steps into array
  const nextSteps = nextStepsText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(step => step.length > 0);
  
  return {
    projectId,
    projectName,
    statusSummary,
    progressScore,
    keyRisks,
    nextSteps,
    generatedAt: new Date().toISOString(),
    aiGenerated: true
  };
};

/**
 * Generate meeting insights based on transcript and notes
 */
export const generateMeetingInsights = async (
  meetingId: string,
  meetingTitle: string,
  transcriptContent: string,
  meetingNoteContent: string,
  attendees: any[]
): Promise<any> => {
  try {
    // Prepare attendee data
    const attendeeData = attendees.map(attendee => ({
      name: attendee.name,
      role: attendee.role || 'Participant'
    }));
    
    // Prepare system prompt for meeting insight generation
    const systemPrompt = `You are an AI assistant that generates insights about meetings based on transcripts and notes.
    Analyze the provided meeting transcript, notes, and attendee information to generate insights about the meeting.
    Focus on:
    1. Meeting effectiveness and efficiency
    2. Participation patterns and engagement
    3. Decision quality and clarity
    4. Action item clarity and assignment
    5. Follow-up requirements
    
    Provide a concise assessment of the meeting's effectiveness.
    Calculate an "effectivenessScore" (1-100) that represents how effective the meeting was.
    Identify key moments or turning points in the discussion.
    Suggest improvements for future meetings.
    
    Be objective, professional, and focus on actionable insights that would improve meeting quality.`;

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Meeting: ${meetingTitle} (ID: ${meetingId})\n\nTranscript:\n${transcriptContent}\n\nMeeting Notes:\n${meetingNoteContent}\n\nAttendees:\n${JSON.stringify(attendeeData, null, 2)}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';
    
    // Parse insights from AI response
    return parseMeetingInsights(aiContent, meetingId, meetingTitle);
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    throw error;
  }
};

/**
 * Parse meeting insights from AI-generated content
 */
const parseMeetingInsights = (content: string, meetingId: string, meetingTitle: string): any => {
  // Extract assessment
  const assessmentMatch = content.match(/Assessment:([\s\S]*?)(?=Effectiveness Score:|Key Moments:|Improvements:|$)/i);
  const assessment = assessmentMatch ? assessmentMatch[1].trim() : '';
  
  // Extract effectiveness score
  const scoreMatch = content.match(/Effectiveness Score:.*?(\d+)/i);
  const effectivenessScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
  
  // Extract key moments
  const momentsMatch = content.match(/Key Moments:([\s\S]*?)(?=Improvements:|$)/i);
  const momentsText = momentsMatch ? momentsMatch[1].trim() : '';
  
  // Parse key moments into array
  const keyMoments = momentsText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(moment => moment.length > 0);
  
  // Extract improvements
  const improvementsMatch = content.match(/Improvements:([\s\S]*?)(?=$)/i);
  const improvementsText = improvementsMatch ? improvementsMatch[1].trim() : '';
  
  // Parse improvements into array
  const improvements = improvementsText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(improvement => improvement.length > 0);
  
  return {
    meetingId,
    meetingTitle,
    assessment,
    effectivenessScore,
    keyMoments,
    improvements,
    generatedAt: new Date().toISOString(),
    aiGenerated: true
  };
};
