import { Request, Response } from 'express';
import { 
  generatePersonInsights,
  generateProjectInsights,
  generateMeetingInsights
} from '../services/ai/insightGeneration.service';
import { InsightGenerationOptions } from '../types/ai';

/**
 * Controller for generating insights about a person
 */
export const generatePersonInsightsController = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { personId } = req.params;
    
    if (!personId) {
      return res.status(400).json({
        success: false,
        message: 'Person ID is required'
      });
    }
    
    // Extract options from request body
    const options: InsightGenerationOptions = {
      depth: req.body.depth || 'detailed',
      timeframe: req.body.timeframe,
      focusAreas: req.body.focusAreas
    };
    
    // Generate insights
    const insights = await generatePersonInsights(personId, options);
    
    return res.status(200).json({
      success: true,
      data: {
        personId,
        insights: insights.insights,
        // Additional fields can be added here if needed
      }
    });
  } catch (error) {
    console.error('Error generating person insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate person insights',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for generating insights about a project
 */
export const generateProjectInsightsController = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }
    
    // Extract options from request body
    const options: InsightGenerationOptions = {
      depth: req.body.depth || 'detailed',
      timeframe: req.body.timeframe,
      focusAreas: req.body.focusAreas
    };
    
    // Generate insights
    const insights = await generateProjectInsights(projectId, options);
    
    return res.status(200).json({
      success: true,
      data: {
        projectId,
        insights: insights.insights,
        // Additional fields can be added here if needed
      }
    });
  } catch (error) {
    console.error('Error generating project insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate project insights',
      error: (error as Error).message
    });
  }
};

/**
 * Controller for generating insights about a meeting
 */
export const generateMeetingInsightsController = async (
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
    const options: InsightGenerationOptions = {
      depth: req.body.depth || 'detailed',
      timeframe: req.body.timeframe,
      focusAreas: req.body.focusAreas
    };
    
    // Generate insights
    const insights = await generateMeetingInsights(meetingId, options);
    
    return res.status(200).json({
      success: true,
      data: {
        meetingId,
        insights: insights.insights,
        // Additional fields can be added here if needed
      }
    });
  } catch (error) {
    console.error('Error generating meeting insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate meeting insights',
      error: (error as Error).message
    });
  }
};
