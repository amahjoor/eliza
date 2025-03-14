const express = require('express');
const { Transcript, Meeting } = require('../models');
const { processTranscription } = require('../services/transcriptionService');
const router = express.Router();

// Get all transcripts
router.get('/', async (req, res) => {
  try {
    const transcripts = await Transcript.findAll({
      include: [{ model: Meeting, as: 'meeting' }]
    });
    res.status(200).json(transcripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ error: 'Failed to fetch transcripts' });
  }
});

// Get transcript by ID
router.get('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findByPk(req.params.id, {
      include: [{ model: Meeting, as: 'meeting' }]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    res.status(200).json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Get transcript by meeting ID
router.get('/meeting/:meetingId', async (req, res) => {
  try {
    const transcript = await Transcript.findOne({
      where: { meetingId: req.params.meetingId },
      include: [{ model: Meeting, as: 'meeting' }]
    });
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found for this meeting' });
    }
    
    res.status(200).json(transcript);
  } catch (error) {
    console.error('Error fetching transcript by meeting ID:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Create a new transcript
router.post('/', async (req, res) => {
  try {
    const { meetingId, content, rawTranscriptPath, metadata } = req.body;
    
    // Validate required fields
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    // Check if meeting exists
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Create transcript
    const transcript = await Transcript.create({
      meetingId,
      content: content || [],
      rawTranscriptPath,
      processingStatus: content ? 'completed' : 'pending',
      metadata
    });
    
    res.status(201).json(transcript);
  } catch (error) {
    console.error('Error creating transcript:', error);
    res.status(500).json({ error: 'Failed to create transcript' });
  }
});

// Process audio to generate transcript
router.post('/process/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check if meeting exists
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if audio path exists
    if (!meeting.audioPath) {
      return res.status(400).json({ error: 'No audio file available for this meeting' });
    }
    
    // Create or update transcript with pending status
    let transcript = await Transcript.findOne({ where: { meetingId } });
    
    if (!transcript) {
      transcript = await Transcript.create({
        meetingId,
        content: [],
        processingStatus: 'pending'
      });
    } else {
      await transcript.update({ processingStatus: 'pending' });
    }
    
    // Start processing in background
    processTranscription(meeting, transcript)
      .then(() => console.log(`Transcription processing completed for meeting ${meetingId}`))
      .catch(err => console.error(`Transcription processing failed for meeting ${meetingId}:`, err));
    
    res.status(202).json({ 
      message: 'Transcription processing started',
      transcriptId: transcript.id
    });
  } catch (error) {
    console.error('Error starting transcription process:', error);
    res.status(500).json({ error: 'Failed to start transcription process' });
  }
});

// Update a transcript
router.put('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findByPk(req.params.id);
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    await transcript.update(req.body);
    res.status(200).json(transcript);
  } catch (error) {
    console.error('Error updating transcript:', error);
    res.status(500).json({ error: 'Failed to update transcript' });
  }
});

// Delete a transcript
router.delete('/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findByPk(req.params.id);
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    await transcript.destroy();
    res.status(200).json({ message: 'Transcript deleted successfully' });
  } catch (error) {
    console.error('Error deleting transcript:', error);
    res.status(500).json({ error: 'Failed to delete transcript' });
  }
});

module.exports = router;
