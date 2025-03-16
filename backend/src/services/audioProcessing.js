const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { Meeting, Transcript } = require('../models');
const { transcribeAudio } = require('./transcriptionService');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

/**
 * Process audio file
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Processing result
 */
const processAudio = async (audioBuffer, metadata = {}) => {
  try {
    // Generate unique filename
    const filename = `recordings/${uuidv4()}.wav`;
    
    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
      Body: audioBuffer,
      ContentType: 'audio/wav'
    };
    
    console.log('Uploading audio to S3...');
    const uploadResult = await s3.upload(uploadParams).promise();
    console.log('Audio uploaded successfully:', uploadResult.Location);
    
    // Create meeting record
    const meeting = await Meeting.create({
      name: metadata.name || 'Untitled Meeting',
      startTime: metadata.startTime || new Date(),
      endTime: metadata.endTime,
      duration: metadata.duration,
      recordingType: metadata.recordingType || 'upload',
      status: 'processing',
      audioPath: uploadResult.Location,
      createdBy: metadata.userId
    });
    
    // Create transcript record
    const transcript = await Transcript.create({
      meetingId: meeting.id,
      processingStatus: 'pending',
      content: []
    });
    
    // Start transcription process asynchronously
    transcribeAudio(uploadResult.Location, transcript.id, meeting.id)
      .catch(error => {
        console.error('Error in transcription process:', error);
        // Update transcript with error status
        transcript.update({
          processingStatus: 'failed',
          processingError: error.message
        });
        
        // Update meeting status
        meeting.update({
          status: 'failed'
        });
      });
    
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

/**
 * Process audio from external meeting platforms
 * @param {Object} meetingData - Meeting data from external platform
 * @param {string} platform - Platform name (zoom, teams, meet)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Processing result
 */
const processExternalMeeting = async (meetingData, platform, userId) => {
  try {
    // Validate platform
    if (!['zoom', 'teams', 'meet'].includes(platform)) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Extract audio URL from meeting data
    let audioUrl;
    switch (platform) {
      case 'zoom':
        audioUrl = meetingData.recording_files.find(file => file.file_type === 'AUDIO_ONLY')?.download_url;
        break;
      case 'teams':
        audioUrl = meetingData.recordingUrl;
        break;
      case 'meet':
        audioUrl = meetingData.audioUrl;
        break;
    }
    
    if (!audioUrl) {
      throw new Error('No audio recording found in meeting data');
    }
    
    // Download audio file
    console.log(`Downloading audio from ${platform}...`);
    const response = await fetch(audioUrl);
    const audioBuffer = await response.arrayBuffer();
    
    // Process the audio
    return await processAudio(Buffer.from(audioBuffer), {
      name: meetingData.topic || meetingData.subject || 'External Meeting',
      startTime: new Date(meetingData.start_time || meetingData.startTime || meetingData.createdTime),
      endTime: new Date(meetingData.end_time || meetingData.endTime || meetingData.lastModifiedTime),
      duration: meetingData.duration,
      recordingType: platform,
      userId
    });
  } catch (error) {
    console.error(`Error processing ${platform} meeting:`, error);
    throw error;
  }
};

/**
 * Process audio from browser recording
 * @param {Buffer} audioBuffer - Audio buffer from browser recording
 * @param {Object} metadata - Meeting metadata
 * @returns {Promise<Object>} Processing result
 */
const processBrowserRecording = async (audioBuffer, metadata) => {
  try {
    return await processAudio(audioBuffer, {
      ...metadata,
      recordingType: 'physical'
    });
  } catch (error) {
    console.error('Error processing browser recording:', error);
    throw error;
  }
};

module.exports = {
  processAudio,
  processExternalMeeting,
  processBrowserRecording
};
