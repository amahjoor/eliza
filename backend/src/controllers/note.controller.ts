import { Request, Response } from 'express';
import { generateMeetingNotes, generateCustomMeetingNotes } from '../services/ai/noteGeneration.service';
import { NoteGenerationOptions } from '../types/ai';

/**
 * Generates meeting notes based on a meeting transcript
 * @param req Request object
 * @param res Response object
 */
export const generateNotesController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const options: NoteGenerationOptions = req.body.options || {};
    
    // Validate meetingId
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    // Generate notes
    const generatedNotes = await generateMeetingNotes(meetingId, options);
    
    // Return generated notes
    return res.status(200).json(generatedNotes);
  } catch (error) {
    console.error('Error generating notes:', error);
    return res.status(500).json({ error: 'Failed to generate meeting notes' });
  }
};

/**
 * Generates custom meeting notes based on a template
 * @param req Request object
 * @param res Response object
 */
export const generateCustomNotesController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { templateId, options } = req.body;
    
    // Validate meetingId and templateId
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Generate custom notes
    const generatedNotes = await generateCustomMeetingNotes(meetingId, templateId, options || {});
    
    // Return generated notes
    return res.status(200).json(generatedNotes);
  } catch (error) {
    console.error('Error generating custom notes:', error);
    return res.status(500).json({ error: 'Failed to generate custom meeting notes' });
  }
};
