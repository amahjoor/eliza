import { Request, Response } from 'express';
import { KnowledgeEntry, KnowledgeConnection } from '../models';
import { generateKnowledgeEntries, generateKnowledgeConnections, generateKnowledgeBaseSummary } from '../services/ai/knowledgeBase.service';
import { Meeting } from '../models';
import { MeetingNote } from '../models';
import { Transcript } from '../models';

/**
 * Get all knowledge entries
 */
export const getAllKnowledgeEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const entries = await KnowledgeEntry.findAll({
      where: { userId },
      order: [['relevance', 'DESC']],
    });
    
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching knowledge entries:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge entries' });
  }
};

/**
 * Get knowledge entry by ID
 */
export const getKnowledgeEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const entry = await KnowledgeEntry.findOne({
      where: { id, userId },
      include: [
        {
          model: KnowledgeConnection,
          as: 'outgoingConnections',
          include: [{ model: KnowledgeEntry, as: 'target' }],
        },
        {
          model: KnowledgeConnection,
          as: 'incomingConnections',
          include: [{ model: KnowledgeEntry, as: 'source' }],
        },
      ],
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching knowledge entry:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge entry' });
  }
};

/**
 * Create knowledge entry
 */
export const createKnowledgeEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const entryData = { ...req.body, userId };
    
    const entry = await KnowledgeEntry.create(entryData);
    
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating knowledge entry:', error);
    res.status(500).json({ error: 'Failed to create knowledge entry' });
  }
};

/**
 * Update knowledge entry
 */
export const updateKnowledgeEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const entry = await KnowledgeEntry.findOne({
      where: { id, userId },
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    await entry.update(req.body);
    
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error updating knowledge entry:', error);
    res.status(500).json({ error: 'Failed to update knowledge entry' });
  }
};

/**
 * Delete knowledge entry
 */
export const deleteKnowledgeEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const entry = await KnowledgeEntry.findOne({
      where: { id, userId },
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    await entry.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    res.status(500).json({ error: 'Failed to delete knowledge entry' });
  }
};

/**
 * Generate knowledge entries from meeting
 */
export const generateKnowledgeFromMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as any).user.id;
    
    // Fetch meeting data
    const meeting = await Meeting.findOne({
      where: { id: meetingId, userId },
      include: [
        { model: Transcript, as: 'transcripts' },
        { model: MeetingNote, as: 'notes' },
      ],
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
    
    // Get existing knowledge entries for this meeting
    const existingEntries = await KnowledgeEntry.findAll({
      where: { meetingId, userId },
    });
    
    // Generate new knowledge entries
    const transcriptContent = meeting.transcripts[0].content;
    const meetingNoteContent = meeting.notes[0].content;
    
    const knowledgeEntries = await generateKnowledgeEntries(
      meetingId,
      transcriptContent,
      meetingNoteContent,
      existingEntries
    );
    
    // Save new entries to database
    const savedEntries = await Promise.all(
      knowledgeEntries.map(async (entry) => {
        // Check if entry already exists
        if (entry.id) {
          const existingEntry = await KnowledgeEntry.findByPk(entry.id);
          if (existingEntry) {
            await existingEntry.update(entry);
            return existingEntry;
          }
        }
        
        // Create new entry
        return KnowledgeEntry.create({
          ...entry,
          userId,
          meetingId,
        });
      })
    );
    
    // Generate connections between entries
    const connections = await generateKnowledgeConnections(savedEntries);
    
    // Save connections to database
    await Promise.all(
      connections.map(async (connection) => {
        return KnowledgeConnection.create(connection);
      })
    );
    
    res.status(200).json({
      entries: savedEntries,
      connections,
    });
  } catch (error) {
    console.error('Error generating knowledge from meeting:', error);
    res.status(500).json({ error: 'Failed to generate knowledge from meeting' });
  }
};

/**
 * Get knowledge base summary
 */
export const getKnowledgeBaseSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get all knowledge entries for this user
    const entries = await KnowledgeEntry.findAll({
      where: { userId },
      order: [['relevance', 'DESC']],
      limit: 100, // Limit to most relevant entries
    });
    
    // Generate summary
    const summary = await generateKnowledgeBaseSummary(entries);
    
    res.status(200).json({
      summary,
      entryCount: entries.length,
    });
  } catch (error) {
    console.error('Error generating knowledge base summary:', error);
    res.status(500).json({ error: 'Failed to generate knowledge base summary' });
  }
};

/**
 * Get knowledge graph data
 */
export const getKnowledgeGraph = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get all knowledge entries for this user
    const entries = await KnowledgeEntry.findAll({
      where: { userId },
      attributes: ['id', 'title', 'type', 'relevance'],
    });
    
    // Get all connections between entries
    const connections = await KnowledgeConnection.findAll({
      include: [
        { model: KnowledgeEntry, as: 'source', where: { userId } },
        { model: KnowledgeEntry, as: 'target', where: { userId } },
      ],
    });
    
    // Format data for graph visualization
    const nodes = entries.map((entry) => ({
      id: entry.id,
      label: entry.title,
      type: entry.type,
      value: entry.relevance / 10, // Scale for visualization
    }));
    
    const edges = connections.map((connection) => ({
      from: connection.sourceId,
      to: connection.targetId,
      label: connection.type,
      value: connection.strength * 2, // Scale for visualization
      title: connection.description,
    }));
    
    res.status(200).json({
      nodes,
      edges,
    });
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge graph' });
  }
};
