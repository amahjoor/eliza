const express = require('express');
const { KnowledgeBase, Meeting, MeetingNote, Transcript } = require('../models');
const { searchKnowledgeBase, generateInsights } = require('../services/knowledgeBaseService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET api/knowledge-base
 * @desc    Get all knowledge base entries
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const knowledgeBaseEntries = await KnowledgeBase.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(knowledgeBaseEntries);
  } catch (error) {
    console.error('Error fetching knowledge base entries:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base entries' });
  }
});

/**
 * @route   GET api/knowledge-base/search
 * @desc    Search knowledge base
 * @access  Private
 */
router.get('/search', async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchKnowledgeBase(query, filters, req.user.id);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

/**
 * @route   GET api/knowledge-base/insights
 * @desc    Generate insights from knowledge base
 * @access  Private
 */
router.get('/insights', async (req, res) => {
  try {
    const { topic, timeframe } = req.query;
    
    const insights = await generateInsights(topic, timeframe, req.user.id);
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

/**
 * @route   GET api/knowledge-base/:id
 * @desc    Get knowledge base entry by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const knowledgeBaseEntry = await KnowledgeBase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!knowledgeBaseEntry) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }
    
    res.status(200).json(knowledgeBaseEntry);
  } catch (error) {
    console.error('Error fetching knowledge base entry:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base entry' });
  }
});

/**
 * @route   POST api/knowledge-base
 * @desc    Create a new knowledge base entry
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, tags, source, sourceId, sourceType } = req.body;
    
    const knowledgeBaseEntry = await KnowledgeBase.create({
      title,
      content,
      tags,
      source,
      sourceId,
      sourceType,
      userId: req.user.id
    });
    
    res.status(201).json(knowledgeBaseEntry);
  } catch (error) {
    console.error('Error creating knowledge base entry:', error);
    res.status(500).json({ error: 'Failed to create knowledge base entry' });
  }
});

/**
 * @route   PUT api/knowledge-base/:id
 * @desc    Update a knowledge base entry
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const knowledgeBaseEntry = await KnowledgeBase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!knowledgeBaseEntry) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }
    
    await knowledgeBaseEntry.update({
      title,
      content,
      tags
    });
    
    res.status(200).json(knowledgeBaseEntry);
  } catch (error) {
    console.error('Error updating knowledge base entry:', error);
    res.status(500).json({ error: 'Failed to update knowledge base entry' });
  }
});

/**
 * @route   DELETE api/knowledge-base/:id
 * @desc    Delete a knowledge base entry
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const knowledgeBaseEntry = await KnowledgeBase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!knowledgeBaseEntry) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }
    
    await knowledgeBaseEntry.destroy();
    
    res.status(200).json({ message: 'Knowledge base entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge base entry:', error);
    res.status(500).json({ error: 'Failed to delete knowledge base entry' });
  }
});

module.exports = router;
