import { Request, Response } from 'express';
import { 
  generatePersonInsights, 
  generateProjectInsights, 
  generateMeetingInsights 
} from '../services/ai/insightGeneration.service';
import { InsightGenerationOptions } from '../types/ai';

/**
 * Generates insights about a person based on their meeting participation
 * @param req Request object
 * @param res Response object
 */
export const generatePersonInsightsController = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;
    const options: InsightGenerationOptions = req.body.options || {};
    
    // Validate personId
    if (!personId) {
      return res.status(400).json({ error: 'Person ID is required' });
    }
    
    // Generate insights
    const insights = await generatePersonInsights(personId, options);
    
    // Return generated insights
    return res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating person insights:', error);
    return res.status(500).json({ error: 'Failed to generate person insights' });
  }
};

/**
 * Generates insights about a project based on related meetings
 * @param req Request object
 * @param res Response object
 */
export const generateProjectInsightsController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const options: InsightGenerationOptions = req.body.options || {};
    
    // Validate projectId
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Generate insights
    const insights = await generateProjectInsights(projectId, options);
    
    // Return generated insights
    return res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating project insights:', error);
    return res.status(500).json({ error: 'Failed to generate project insights' });
  }
};

/**
 * Generates insights about a meeting based on its transcript and notes
 * @param req Request object
 * @param res Response object
 */
export const generateMeetingInsightsController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const options: InsightGenerationOptions = req.body.options || {};
    
    // Validate meetingId
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    // Generate insights
    const insights = await generateMeetingInsights(meetingId, options);
    
    // Return generated insights
    return res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    return res.status(500).json({ error: 'Failed to generate meeting insights' });
  }
};
