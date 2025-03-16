import { Request, Response } from 'express';
import { Person, Project, Meeting, Transcript, MeetingNote } from '../models';
import { 
  generatePersonInsights, 
  generateProjectInsights, 
  generateMeetingInsights 
} from '../services/ai/insightGeneration.service';

/**
 * Generate insights for a person
 */
export const generatePersonInsightsController = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;
    const userId = (req as any).user.id;
    
    // Fetch person data
    const person = await Person.findOne({
      where: { id: personId, userId },
      include: [
        { 
          model: Meeting, 
          as: 'meetings',
          include: [
            { model: Transcript, as: 'transcripts' },
            { model: MeetingNote, as: 'notes' }
          ]
        }
      ]
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    // Extract meeting history
    const meetingHistory = person.meetings.map(meeting => ({
      title: meeting.title,
      date: meeting.date,
      role: (meeting as any).MeetingAttendees?.role || 'Participant',
      contributions: []
    }));
    
    // Extract transcript excerpts
    const transcriptExcerpts = person.meetings
      .filter(meeting => meeting.transcripts && meeting.transcripts.length > 0)
      .map(meeting => {
        const transcript = meeting.transcripts[0];
        const content = transcript.content;
        
        // Extract parts of the transcript where this person is speaking
        // This is a simplified version - in a real implementation, you would use
        // the speaker map to identify this person's contributions
        const personName = `${person.firstName} ${person.lastName}`;
        const lines = content.split('\n');
        const personLines = lines.filter(line => line.includes(personName));
        
        return personLines.join('\n');
      });
    
    // Generate insights
    const insights = await generatePersonInsights(
      personId,
      `${person.firstName} ${person.lastName}`,
      meetingHistory,
      transcriptExcerpts
    );
    
    // Update person with insights
    await person.update({
      aiSummary: insights.summary,
      networkConnectivity: insights.networkConnectivity,
      contributions: person.contributions || []
    });
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating person insights:', error);
    res.status(500).json({ error: 'Failed to generate person insights' });
  }
};

/**
 * Generate insights for a project
 */
export const generateProjectInsightsController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    
    // Fetch project data
    const project = await Project.findOne({
      where: { id: projectId, userId },
      include: [
        { 
          model: Meeting, 
          as: 'meetings',
          include: [
            { model: MeetingNote, as: 'notes' }
          ]
        },
        {
          model: Person,
          as: 'members'
        }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Extract meeting data
    const relatedMeetings = project.meetings.map(meeting => ({
      title: meeting.title,
      date: meeting.date,
      summary: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].summary : '',
      actionItems: meeting.notes && meeting.notes.length > 0 ? meeting.notes[0].actionItems : []
    }));
    
    // Extract team member data
    const teamMembers = project.members.map(member => ({
      name: `${member.firstName} ${member.lastName}`,
      role: (member as any).ProjectMembers?.role || 'Team Member',
      expertiseAreas: []
    }));
    
    // Generate insights
    const insights = await generateProjectInsights(
      projectId,
      project.name,
      project.description || '',
      relatedMeetings,
      teamMembers
    );
    
    // Update project with insights
    await project.update({
      statusSummary: insights.statusSummary,
      progressScore: insights.progressScore,
      keyRisks: insights.keyRisks,
      nextSteps: insights.nextSteps
    });
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating project insights:', error);
    res.status(500).json({ error: 'Failed to generate project insights' });
  }
};

/**
 * Generate insights for a meeting
 */
export const generateMeetingInsightsController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as any).user.id;
    
    // Fetch meeting data
    const meeting = await Meeting.findOne({
      where: { id: meetingId, userId },
      include: [
        { model: Transcript, as: 'transcripts' },
        { model: MeetingNote, as: 'notes' },
        { model: Person, as: 'attendees' }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (!meeting.transcripts || meeting.transcripts.length === 0) {
      return res.status(400).json({ error: 'Meeting transcript not found' });
    }
    
    if (!meeting.notes || meeting.notes.length === 0) {
      return res.status(400).json({ error: 'Meeting notes not found' });
    }
    
    // Extract attendee data
    const attendees = meeting.attendees.map(attendee => ({
      name: `${attendee.firstName} ${attendee.lastName}`,
      role: (attendee as any).MeetingAttendees?.role || 'Participant'
    }));
    
    // Generate insights
    const insights = await generateMeetingInsights(
      meetingId,
      meeting.title,
      meeting.transcripts[0].content,
      meeting.notes[0].content,
      attendees
    );
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    res.status(500).json({ error: 'Failed to generate meeting insights' });
  }
};
