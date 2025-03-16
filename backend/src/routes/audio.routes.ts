import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { Meeting, Transcript } from '../models'
import { processAudio } from '../services/audioProcessing.service'

const router = express.Router()

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueFilename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedMimeTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp4',
      'audio/webm',
      'audio/ogg'
    ]
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'))
    }
  }
})

// Upload and process audio file
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }
    
    const { userId, meetingName, recordingType, projectId } = req.body
    
    // Create meeting record
    const meeting = await Meeting.create({
      name: meetingName || `Meeting on ${new Date().toLocaleDateString()}`,
      startTime: new Date(),
      recordingType: recordingType || 'upload',
      recordingUrl: req.file.path,
      status: 'processing',
      userId,
      projectId: projectId || null
    })
    
    // Create transcript record
    const transcript = await Transcript.create({
      meetingId: meeting.id,
      processingStatus: 'pending'
    })
    
    // Process audio asynchronously
    processAudio(req.file.path, meeting.id, transcript.id)
      .catch(error => console.error('Error processing audio:', error))
    
    return res.status(201).json({
      message: 'Audio uploaded successfully and processing started',
      meetingId: meeting.id
    })
    
  } catch (error) {
    console.error('Error uploading audio:', error)
    return res.status(500).json({ error: 'Failed to upload and process audio' })
  }
})

// Get audio processing status
router.get('/status/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params
    
    const transcript = await Transcript.findOne({
      where: { meetingId }
    })
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' })
    }
    
    return res.status(200).json({
      status: transcript.processingStatus,
      error: transcript.errorMessage
    })
    
  } catch (error) {
    console.error('Error getting audio status:', error)
    return res.status(500).json({ error: 'Failed to get audio processing status' })
  }
})

export default router
