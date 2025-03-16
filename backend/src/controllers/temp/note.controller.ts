import { Request, Response } from 'express';
import { generateMeetingNotes, generateCustomMeetingNotes } from '../services/ai/noteGeneration.service';

/**
 * Generate meeting notes from transcript
 */
export const generateNotesController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as any).user.id;
    const { templateId, customInstructions } = req.body;
    
    const meetingNote = await generateMeetingNotes(
      meetingId,
      userId,
      templateId,
      customInstructions
    );
    
    res.status(201).json(meetingNote);
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    res.status(500).json({ error: 'Failed to generate meeting notes' });
  }
};

/**
 * Generate custom meeting notes with specific parameters
 */
export const generateCustomNotesController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as any).user.id;
    const options = req.body;
    
    const meetingNote = await generateCustomMeetingNotes(
      meetingId,
      userId,
      options
    );
    
    res.status(201).json(meetingNote);
  } catch (error) {
    console.error('Error generating custom meeting notes:', error);
    res.status(500).json({ error: 'Failed to generate custom meeting notes' });
  }
};
