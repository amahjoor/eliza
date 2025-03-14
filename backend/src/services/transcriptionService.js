const AWS = require('aws-sdk');
const { Configuration, OpenAIApi } = require('openai');
const { Meeting, Transcript } = require('../models');
const { generateMeetingSummary } = require('./aiSummaryService');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Process audio file to generate transcript with speaker diarization
 * @param {Object} meeting - Meeting object
 * @param {Object} transcript - Transcript object
 * @returns {Promise<Object>} - Updated transcript
 */
const processTranscription = async (meeting, transcript) => {
  try {
    // Update transcript status
    await transcript.update({ processingStatus: 'diarizing' });
    
    // Get audio file from S3
    const audioData = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: meeting.audioPath
    }).promise();
    
    // Update transcript status
    await transcript.update({ processingStatus: 'transcribing' });
    
    // Use OpenAI Whisper API for transcription with diarization
    const transcriptionResponse = await openai.createTranscription(
      audioData.Body,
      "whisper-1",
      "Transcribe the following meeting audio with speaker diarization.",
      "verbose_json",
      0.2,
      "en"
    );
    
    // Process the response to format transcript segments
    const segments = transcriptionResponse.data.segments.map(segment => ({
      time: formatTimestamp(segment.start),
      endTime: formatTimestamp(segment.end),
      speaker: `Speaker ${segment.speaker}`,
      text: segment.text.trim()
    }));
    
    // Update transcript with processed content
    await transcript.update({
      content: segments,
      processingStatus: 'completed'
    });
    
    // Update meeting status
    await meeting.update({ status: 'completed' });
    
    // Generate AI summary from transcript
    await generateMeetingSummary(meeting.id, segments);
    
    return transcript;
  } catch (error) {
    console.error('Error processing transcription:', error);
    
    // Update transcript with error status
    await transcript.update({
      processingStatus: 'failed',
      processingError: error.message
    });
    
    // Update meeting with error status
    await meeting.update({ status: 'failed' });
    
    throw error;
  }
};

/**
 * Format timestamp in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
const formatTimestamp = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

module.exports = {
  processTranscription
};
