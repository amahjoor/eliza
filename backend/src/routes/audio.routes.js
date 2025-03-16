const express = require('express');
const multer = require('multer');
const { processAudio, processExternalMeeting, processBrowserRecording } = require('../services/audioProcessing');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
});

/**
 * @route   POST api/audio/upload
 * @desc    Upload audio file and start processing
 * @access  Private
 */
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const audioBuffer = req.file.buffer;
    const metadata = {
      name: req.body.name || 'Uploaded Recording',
      startTime: req.body.startTime ? new Date(req.body.startTime) : new Date(),
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      recordingType: 'upload',
      userId: req.user.id
    };
    
    const result = await processAudio(audioBuffer, metadata);
    res.status(200).json({ message: 'Audio processed successfully', result });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

/**
 * @route   POST api/audio/browser-recording
 * @desc    Process audio from browser recording
 * @access  Private
 */
router.post('/browser-recording', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const audioBuffer = req.file.buffer;
    const metadata = {
      name: req.body.name || 'Browser Recording',
      startTime: req.body.startTime ? new Date(req.body.startTime) : new Date(),
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      userId: req.user.id
    };
    
    const result = await processBrowserRecording(audioBuffer, metadata);
    res.status(200).json({ message: 'Browser recording processed successfully', result });
  } catch (error) {
    console.error('Error processing browser recording:', error);
    res.status(500).json({ error: 'Failed to process browser recording' });
  }
});

/**
 * @route   POST api/audio/external/:platform
 * @desc    Process audio from external meeting platform (zoom, teams, meet)
 * @access  Private
 */
router.post('/external/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const meetingData = req.body;
    
    if (!meetingData) {
      return res.status(400).json({ error: 'No meeting data provided' });
    }
    
    const result = await processExternalMeeting(meetingData, platform, req.user.id);
    res.status(200).json({ message: `${platform} meeting processed successfully`, result });
  } catch (error) {
    console.error(`Error processing ${req.params.platform} meeting:`, error);
    res.status(500).json({ error: `Failed to process ${req.params.platform} meeting` });
  }
});

/**
 * @route   GET api/audio/status/:meetingId
 * @desc    Check audio processing status
 * @access  Private
 */
router.get('/status/:meetingId', async (req, res) => {
  try {
    const { Meeting, Transcript } = require('../models');
    
    const meeting = await Meeting.findOne({
      where: { 
        id: req.params.meetingId,
        createdBy: req.user.id
      },
      include: [
        { model: Transcript, as: 'transcript', attributes: ['id', 'processingStatus', 'processingError'] }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.status(200).json({
      meetingId: meeting.id,
      status: meeting.status,
      transcriptStatus: meeting.transcript ? meeting.transcript.processingStatus : null,
      error: meeting.transcript && meeting.transcript.processingError ? meeting.transcript.processingError : null
    });
  } catch (error) {
    console.error('Error checking audio processing status:', error);
    res.status(500).json({ error: 'Failed to check audio processing status' });
  }
});

module.exports = router;
