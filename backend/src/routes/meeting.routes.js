const express = require('express');
const { Meeting, MeetingNote, Transcript, Person, MeetingAttendee } = require('../models');
const router = express.Router();

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      order: [['startTime', 'DESC']],
      include: [
        { model: Person, as: 'attendees' }
      ]
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get meeting by ID
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        { model: Person, as: 'attendees' },
        { model: Transcript, as: 'transcript' },
        { model: MeetingNote, as: 'notes' }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.status(200).json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Create a new meeting
router.post('/', async (req, res) => {
  try {
    const { name, startTime, recordingType, attendeeIds, ...meetingData } = req.body;
    
    // Validate required fields
    if (!name || !startTime || !recordingType) {
      return res.status(400).json({ error: 'Name, start time, and recording type are required' });
    }
    
    // Create the meeting
    const meeting = await Meeting.create({
      name,
      startTime,
      recordingType,
      status: 'scheduled',
      createdBy: req.user.id, // Assuming auth middleware sets req.user
      ...meetingData
    });
    
    // Add attendees if provided
    if (attendeeIds && attendeeIds.length > 0) {
      await Promise.all(
        attendeeIds.map(personId => 
          MeetingAttendee.create({
            MeetingId: meeting.id,
            PersonId: personId
          })
        )
      );
    }
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', async (req, res) => {
  try {
    const { attendeeIds, ...updateData } = req.body;
    const meeting = await Meeting.findByPk(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Update meeting data
    await meeting.update(updateData);
    
    // Update attendees if provided
    if (attendeeIds) {
      // Remove existing attendees
      await MeetingAttendee.destroy({
        where: { MeetingId: meeting.id }
      });
      
      // Add new attendees
      if (attendeeIds.length > 0) {
        await Promise.all(
          attendeeIds.map(personId => 
            MeetingAttendee.create({
              MeetingId: meeting.id,
              PersonId: personId
            })
          )
        );
      }
    }
    
    // Fetch updated meeting with associations
    const updatedMeeting = await Meeting.findByPk(req.params.id, {
      include: [
        { model: Person, as: 'attendees' }
      ]
    });
    
    res.status(200).json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    await meeting.destroy();
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

module.exports = router;
