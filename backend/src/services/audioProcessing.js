const AWS = require('aws-sdk');
const { Meeting, Transcript } = require('../models');
const { processTranscription } = require('./transcriptionService');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

/**
 * Process audio file and initiate transcription
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {Object} metadata - Additional metadata about the recording
 * @returns {Promise<Object>} - Processing result
 */
const processAudio = async (audioBuffer, metadata = {}) => {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `recording_${timestamp}.wav`;
    const s3Key = `recordings/${filename}`;
    
    // Upload to S3
    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/wav'
    }).promise();
    
    // Create a new meeting record
    const meeting = await Meeting.create({
      name: metadata.name || `Meeting ${new Date().toLocaleString()}`,
      startTime: metadata.startTime || new Date(),
      endTime: metadata.endTime,
      duration: metadata.duration,
      recordingType: metadata.recordingType || 'upload',
      status: 'processing',
      audioPath: s3Key,
      createdBy: metadata.userId || '00000000-0000-0000-0000-000000000000', // Default user ID if not provided
      metadata: {
        originalFilename: metadata.originalFilename,
        fileSize: audioBuffer.length,
        ...metadata
      }
    });
    
    // Create a transcript record with pending status
    const transcript = await Transcript.create({
      meetingId: meeting.id,
      content: [],
      processingStatus: 'pending'
    });
    
    // Start transcription process in background
    processTranscription(meeting, transcript)
      .then(() => console.log(`Transcription completed for meeting ${meeting.id}`))
      .catch(err => console.error(`Transcription failed for meeting ${meeting.id}:`, err));
    
    return {
      meetingId: meeting.id,
      transcriptId: transcript.id,
      status: 'processing'
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
};

module.exports = {
  processAudio
};
