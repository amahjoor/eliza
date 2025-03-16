import { Request, Response } from 'express';
import { 
  extractKnowledgeFromTranscript, 
  generateKnowledgeConnections,
  searchKnowledgeBase
} from '../services/ai/knowledgeBase.service';

/**
 * Extracts knowledge entries from a meeting transcript
 * @param req Request object
 * @param res Response object
 */
export const extractKnowledgeController = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { transcriptContent } = req.body;
    
    // Validate meetingId and transcriptContent
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    if (!transcriptContent) {
      return res.status(400).json({ error: 'Transcript content is required' });
    }
    
    // Extract knowledge
    const knowledgeEntries = await extractKnowledgeFromTranscript(meetingId, transcriptContent);
    
    // Return extracted knowledge
    return res.status(200).json(knowledgeEntries);
  } catch (error) {
    console.error('Error extracting knowledge:', error);
    return res.status(500).json({ error: 'Failed to extract knowledge from transcript' });
  }
};

/**
 * Generates connections between knowledge entries
 * @param req Request object
 * @param res Response object
 */
export const generateConnectionsController = async (req: Request, res: Response) => {
  try {
    const { knowledgeEntries } = req.body;
    
    // Validate knowledgeEntries
    if (!knowledgeEntries || !Array.isArray(knowledgeEntries) || knowledgeEntries.length === 0) {
      return res.status(400).json({ error: 'Knowledge entries are required' });
    }
    
    // Generate connections
    const connections = await generateKnowledgeConnections(knowledgeEntries);
    
    // Return generated connections
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error generating knowledge connections:', error);
    return res.status(500).json({ error: 'Failed to generate knowledge connections' });
  }
};

/**
 * Searches the knowledge base for relevant entries
 * @param req Request object
 * @param res Response object
 */
export const searchKnowledgeController = async (req: Request, res: Response) => {
  try {
    const { query, options } = req.body;
    
    // Validate query
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Search knowledge base
    const results = await searchKnowledgeBase(query, options);
    
    // Return search results
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return res.status(500).json({ error: 'Failed to search knowledge base' });
  }
};

/**
 * Gets the knowledge graph data
 * @param req Request object
 * @param res Response object
 */
export const getKnowledgeGraphController = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we would fetch the knowledge graph data from the database
    // For now, we'll use mock data
    const mockGraphData = {
      nodes: [
        { id: 'knowledge-1', title: 'Project Timeline', type: 'process', relevance: 85 },
        { id: 'knowledge-2', title: 'Frontend Technology Stack', type: 'decision', relevance: 90 },
        { id: 'knowledge-3', title: 'User Authentication Flow', type: 'process', relevance: 80 },
        { id: 'knowledge-4', title: 'Database Schema', type: 'concept', relevance: 95 },
        { id: 'knowledge-5', title: 'API Endpoints', type: 'fact', relevance: 85 }
      ],
      edges: [
        { source: 'knowledge-1', target: 'knowledge-2', type: 'related', strength: 70, description: 'Timeline affects technology choices' },
        { source: 'knowledge-2', target: 'knowledge-3', type: 'depends_on', strength: 85, description: 'Frontend depends on authentication' },
        { source: 'knowledge-3', target: 'knowledge-4', type: 'related', strength: 60, description: 'Authentication requires database schema' },
        { source: 'knowledge-4', target: 'knowledge-5', type: 'supports', strength: 90, description: 'Schema defines API structure' }
      ]
    };
    
    // Return knowledge graph data
    return res.status(200).json(mockGraphData);
  } catch (error) {
    console.error('Error getting knowledge graph:', error);
    return res.status(500).json({ error: 'Failed to get knowledge graph' });
  }
};
