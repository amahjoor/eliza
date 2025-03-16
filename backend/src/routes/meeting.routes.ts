import express from 'express'
import { Meeting, MeetingNote, Transcript, Person } from '../models'
import { generateMeetingNotes } from '../services/ai.service'

const router = express.Router()

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const { userId, projectId, limit = 20, offset = 0 } = req.query
    
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (projectId) {
      where.projectId = projectId
    }
    
    const meetings = await Meeting.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['startTime', 'DESC']],
      include: [
        {
          model: Person,
          as: 'attendees',
          through: { attributes: [] }
        }
      ]
    })
    
    return res.status(200).json(meetings)
    
  } catch (error) {
    console.error('Error getting meetings:', error)
    return res.status(500).json({ error: 'Failed to get meetings' })
  }
})

// Get meeting by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const meeting = await Meeting.findByPk(id, {
      include: [
        {
          model: Person,
          as: 'attendees',
          through: { attributes: [] }
        }
      ]
    })
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    
    return res.status(200).json(meeting)
    
  } catch (error) {
    console.error('Error getting meeting:', error)
    return res.status(500).json({ error: 'Failed to get meeting' })
  }
})

// Create a new meeting
router.post('/', async (req, res) => {
  try {
    const { name, startTime, recordingType, userId, projectId, attendeeIds } = req.body
    
    const meeting = await Meeting.create({
      name,
      startTime: startTime || new Date(),
      recordingType,
      status: 'recording',
      userId,
      projectId: projectId || null
    })
    
    // Add attendees if provided
    if (attendeeIds && attendeeIds.length > 0) {
      // In a real implementation, we would use Sequelize's association methods
      // For now, we'll just log the action
      console.log(`Adding ${attendeeIds.length} attendees to meeting ${meeting.id}`)
    }
    
    return res.status(201).json(meeting)
    
  } catch (error) {
    console.error('Error creating meeting:', error)
    return res.status(500).json({ error: 'Failed to create meeting' })
  }
})

// Update a meeting
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, endTime, status, projectId, attendeeIds } = req.body
    
    const meeting = await Meeting.findByPk(id)
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    
    // Update meeting fields
    if (name) meeting.name = name
    if (endTime) meeting.endTime = endTime
    if (status) meeting.status = status
    if (projectId !== undefined) meeting.projectId = projectId
    
    await meeting.save()
    
    // Update attendees if provided
    if (attendeeIds && attendeeIds.length > 0) {
      // In a real implementation, we would use Sequelize's association methods
      // For now, we'll just log the action
      console.log(`Updating attendees for meeting ${meeting.id} to ${attendeeIds.length} attendees`)
    }
    
    return res.status(200).json(meeting)
    
  } catch (error) {
    console.error('Error updating meeting:', error)
    return res.status(500).json({ error: 'Failed to update meeting' })
  }
})

// Get meeting transcript
router.get('/:id/transcript', async (req, res) => {
  try {
    const { id } = req.params
    
    const transcript = await Transcript.findOne({
      where: { meetingId: id }
    })
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' })
    }
    
    return res.status(200).json(transcript)
    
  } catch (error) {
    console.error('Error getting transcript:', error)
    return res.status(500).json({ error: 'Failed to get transcript' })
  }
})

// Get meeting notes
router.get('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params
    
    const notes = await MeetingNote.findOne({
      where: { meetingId: id }
    })
    
    if (!notes) {
      return res.status(404).json({ error: 'Meeting notes not found' })
    }
    
    return res.status(200).json(notes)
    
  } catch (error) {
    console.error('Error getting meeting notes:', error)
    return res.status(500).json({ error: 'Failed to get meeting notes' })
  }
})

// Generate meeting notes
router.post('/:id/generate-notes', async (req, res) => {
  try {
    const { id } = req.params
    const { templateId } = req.body
    
    const meeting = await Meeting.findByPk(id)
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    
    const transcript = await Transcript.findOne({
      where: { meetingId: id }
    })
    
    if (!transcript || transcript.processingStatus !== 'completed') {
      return res.status(400).json({ 
        error: 'Cannot generate notes: transcript not ready',
        status: transcript ? transcript.processingStatus : 'not_found'
      })
    }
    
    // Check if notes already exist
    const existingNotes = await MeetingNote.findOne({
      where: { meetingId: id }
    })
    
    if (existingNotes) {
      return res.status(400).json({ 
        error: 'Meeting notes already exist',
        noteId: existingNotes.id
      })
    }
    
    // Generate notes asynchronously
    generateMeetingNotes(id, templateId)
      .catch(error => console.error('Error generating meeting notes:', error))
    
    return res.status(202).json({
      message: 'Meeting note generation started',
      meetingId: id
    })
    
  } catch (error) {
    console.error('Error generating meeting notes:', error)
    return res.status(500).json({ error: 'Failed to generate meeting notes' })
  }
})

export default router
