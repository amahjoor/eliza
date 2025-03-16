const express = require('express');
const { searchAll, searchMeetings, searchPeople, searchProjects, searchKnowledgeBase } = require('../services/searchService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET api/search
 * @desc    Search across all content types
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { ValidationError } = require('../middleware/errorHandler');
    const { query, filters } = req.query;
    
    if (!query) {
      throw new ValidationError('Search query is required', { query: 'Search query cannot be empty' });
    }
    
    const results = await searchAll(query, filters, req.user.id);
    
    res.status(200).json(results);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

/**
 * @route   GET api/search/meetings
 * @desc    Search meetings
 * @access  Private
 */
router.get('/meetings', async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchMeetings(query, filters, req.user.id);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching meetings:', error);
    res.status(500).json({ error: 'Failed to search meetings' });
  }
});

/**
 * @route   GET api/search/people
 * @desc    Search people
 * @access  Private
 */
router.get('/people', async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchPeople(query, filters, req.user.id);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching people:', error);
    res.status(500).json({ error: 'Failed to search people' });
  }
});

/**
 * @route   GET api/search/projects
 * @desc    Search projects
 * @access  Private
 */
router.get('/projects', async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchProjects(query, filters, req.user.id);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

/**
 * @route   GET api/search/knowledge-base
 * @desc    Search knowledge base
 * @access  Private
 */
router.get('/knowledge-base', async (req, res) => {
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

module.exports = router;
