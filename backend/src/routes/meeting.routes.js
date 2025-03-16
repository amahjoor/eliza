const express = require('express');
const router = express.Router();
const { Meeting, MeetingNote, Transcript, Person } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { emitStatusUpdate, emitTranscriptUpdate } = require('../services/socketService');

/**
 * @route GET /api/meetings
 * @desc Get all meetings for the authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const meetings = await Meeting.findAll({
      where: { createdBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/meetings/:id
 * @desc Get a meeting by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, createdBy: req.user.id },
      include: [
        { model: Transcript, as: 'transcript' },
        { model: MeetingNote, as: 'notes' },
        { model: Person, as: 'attendees' }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/meetings
 * @desc Create a new meeting
 * @access Private
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, projectId, templateId, attendeeIds } = req.body;
    
    const meeting = await Meeting.create({
      title,
      description,
      startTime,
      endTime,
      projectId,
      templateId,
      status: 'scheduled',
      createdBy: req.user.id
    });
    
    // Add attendees if provided
    if (attendeeIds && attendeeIds.length > 0) {
      await meeting.addAttendees(attendeeIds);
    }
    
    // Create empty transcript and notes
    await Transcript.create({
      meetingId: meeting.id,
      content: {},
      status: 'pending'
    });
    
    await MeetingNote.create({
      meetingId: meeting.id,
      content: {},
      format: 'markdown',
      aiGenerated: false
    });
    
    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/meetings/:id
 * @desc Update a meeting
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, projectId, templateId, status, attendeeIds } = req.body;
    
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    // Update meeting details
    await meeting.update({
      title: title || meeting.title,
      description: description || meeting.description,
      startTime: startTime || meeting.startTime,
      endTime: endTime || meeting.endTime,
      projectId: projectId || meeting.projectId,
      templateId: templateId || meeting.templateId,
      status: status || meeting.status
    });
    
    // Update attendees if provided
    if (attendeeIds && attendeeIds.length > 0) {
      await meeting.setAttendees(attendeeIds);
    }
    
    // Emit status update via socket if status changed
    if (status && status !== meeting.status) {
      const io = req.app.get('io');
      emitStatusUpdate(io, meeting.id, { status });
    }
    
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/meetings/:id
 * @desc Delete a meeting
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    await meeting.destroy();
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/meetings/:id/start
 * @desc Start a meeting recording
 * @access Private
 */
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    await meeting.update({ status: 'in_progress' });
    
    // Emit status update via socket
    const io = req.app.get('io');
    emitStatusUpdate(io, meeting.id, { 
      status: 'recording',
      message: 'Meeting recording started'
    });
    
    res.json({ message: 'Meeting recording started', meeting });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/meetings/:id/stop
 * @desc Stop a meeting recording
 * @access Private
 */
router.post('/:id/stop', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: true, message: 'Meeting not found' });
    }
    
    await meeting.update({ status: 'processing' });
    
    // Emit status update via socket
    const io = req.app.get('io');
    emitStatusUpdate(io, meeting.id, { 
      status: 'processing',
      message: 'Processing meeting recording'
    });
    
    res.json({ message: 'Meeting recording stopped', meeting });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/meetings/:id/transcript
 * @desc Get meeting transcript
 * @access Private
 */
router.get('/:id/transcript', authenticateToken, async (req, res, next) => {
  try {
    const transcript = await Transcript.findOne({
      where: { meetingId: req.params.id },
      include: [{ model: Meeting, as: 'meeting', where: { createdBy: req.user.id } }]
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
 * @route GET /api/meetings/:id/notes
 * @desc Get meeting notes
 * @access Private
 */
router.get('/:id/notes', authenticateToken, async (req, res, next) => {
  try {
    const notes = await MeetingNote.findOne({
      where: { meetingId: req.params.id },
      include: [{ model: Meeting, as: 'meeting', where: { createdBy: req.user.id } }]
    });
    
    if (!notes) {
      return res.status(404).json({ error: true, message: 'Meeting notes not found' });
    }
    
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/meetings/:id/notes/:noteId
 * @desc Update meeting notes
 * @access Private
 */
router.put('/:id/notes/:noteId', authenticateToken, async (req, res, next) => {
  try {
    const { summary, actionItems, content } = req.body;
    
    const notes = await MeetingNote.findOne({
      where: { id: req.params.noteId, meetingId: req.params.id },
      include: [{ model: Meeting, as: 'meeting', where: { createdBy: req.user.id } }]
    });
    
    if (!notes) {
      return res.status(404).json({ error: true, message: 'Meeting notes not found' });
    }
    
    await notes.update({
      summary: summary || notes.summary,
      actionItems: actionItems || notes.actionItems,
      content: content || notes.content,
      updatedAt: new Date()
    });
    
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
