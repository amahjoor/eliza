const express = require('express');
const router = express.Router();
const { Transcript, Meeting } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { emitTranscriptUpdate } = require('../services/socketService');

/**
 * @route GET /api/transcripts
 * @desc Get all transcripts for the authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const transcripts = await Transcript.findAll({
      include: [
        {
          model: Meeting,
          as: 'meeting',
          where: { createdBy: req.user.id }
        }
      ]
    });
    
    res.json(transcripts);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/transcripts/:id
 * @desc Get a transcript by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const transcript = await Transcript.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Meeting,
          as: 'meeting',
          where: { createdBy: req.user.id }
        }
      ]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: true, message: 'Transcript not found' });
    }
    
    res.json(transcript);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/transcripts/meeting/:meetingId
 * @desc Get transcript by meeting ID
 * @access Private
 */
router.get('/meeting/:meetingId', authenticateToken, async (req, res, next) => {
  try {
    const transcript = await Transcript.findOne({
      where: { meetingId: req.params.meetingId },
      include: [
        {
          model: Meeting,
          as: 'meeting',
          where: { createdBy: req.user.id }
        }
      ]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: true, message: 'Transcript not found' });
    }
    
    res.json(transcript);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/transcripts/:id
 * @desc Update a transcript
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { content, segments, status } = req.body;
    
    const transcript = await Transcript.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Meeting,
          as: 'meeting',
          where: { createdBy: req.user.id }
        }
      ]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: true, message: 'Transcript not found' });
    }
    
    // Update transcript
    await transcript.update({
      content: content || transcript.content,
      segments: segments || transcript.segments,
      status: status || transcript.status,
      updatedAt: new Date()
    });
    
    // Emit transcript update via socket
    const io = req.app.get('io');
    if (io) {
      emitTranscriptUpdate(io, transcript.meetingId, {
        segments: transcript.segments,
        status: transcript.status
      });
    }
    
    res.json(transcript);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/transcripts/segment
 * @desc Add a new segment to a transcript (for real-time updates)
 * @access Private
 */
router.post('/segment', authenticateToken, async (req, res, next) => {
  try {
    const { meetingId, segment } = req.body;
    
    if (!meetingId || !segment) {
      return res.status(400).json({ error: true, message: 'Meeting ID and segment are required' });
    }
    
    // Verify meeting belongs to user
    const meeting = await Meeting.findOne({
      where: { id: meetingId, createdBy: req.user.id }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    // Get transcript
    const transcript = await Transcript.findOne({
      where: { meetingId }
    });
    
    if (!transcript) {
      return res.status(404).json({ error: true, message: 'Transcript not found' });
    }
    
    // Add segment to transcript
    const segments = transcript.segments || [];
    segments.push(segment);
    
    await transcript.update({
      segments,
      status: 'in_progress',
      updatedAt: new Date()
    });
    
    // Emit transcript update via socket
    const io = req.app.get('io');
    if (io) {
      emitTranscriptUpdate(io, meetingId, {
        segments,
        status: 'in_progress'
      });
    }
    
    res.json({ success: true, message: 'Segment added to transcript' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/transcripts/:id
 * @desc Delete a transcript
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const transcript = await Transcript.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Meeting,
          as: 'meeting',
          where: { createdBy: req.user.id }
        }
      ]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: true, message: 'Transcript not found' });
    }
    
    await transcript.destroy();
    
    res.json({ message: 'Transcript deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
