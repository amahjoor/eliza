import { Request, Response } from 'express';
import { 
  generateMeetingNotes,
  generateCustomMeetingNotes
} from '../services/ai/noteGeneration.service';
import { NoteGenerationOptions } from '../types/ai';

/**
 * Controller for generating meeting notes
 */
export const generateNotesController = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required'
      });
    }
    
    // Extract options from request body
    const options: NoteGenerationOptions = {
      detailLevel: req.body.detailLevel || 2,
      format: req.body.format || 'markdown',
      includeActionItems: req.body.includeActionItems !== false,
      includeFollowUps: req.body.includeFollowUps !== false,
      includeSummary: req.body.includeSummary !== false,
      customSections: req.body.customSections,
      style: req.body.style,
      focusAreas: req.body.focusAreas,
      excludeTopics: req.body.excludeTopics,
      maxLength: req.body.maxLength
    };
    
    // Generate notes
    const notes = await generateMeetingNotes(meetingId, options);
    
    return res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate meeting notes',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for generating custom meeting notes
 */
export const generateCustomNotesController = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { meetingId } = req.params;
    const { templateId, customInstructions } = req.body;
    
    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required'
      });
    }
    
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }
    
    // Extract options from request body
    const options: NoteGenerationOptions = {
      detailLevel: req.body.detailLevel || 2,
      format: req.body.format || 'markdown',
      includeActionItems: req.body.includeActionItems !== false,
      includeFollowUps: req.body.includeFollowUps !== false,
      includeSummary: req.body.includeSummary !== false,
      customSections: req.body.customSections,
      templateId,
      style: req.body.style,
      focusAreas: req.body.focusAreas,
      excludeTopics: req.body.excludeTopics,
      maxLength: req.body.maxLength
    };
    
    // Generate custom notes
    const notes = await generateCustomMeetingNotes(meetingId, templateId, options);
    
    return res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error generating custom meeting notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate custom meeting notes',
      error: (error as Error).message
    });
  }
};
