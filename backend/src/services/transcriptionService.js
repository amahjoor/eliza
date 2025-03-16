const { OpenAI } = require('openai');
const AWS = require('aws-sdk');
const { Transcript, Meeting, MeetingNote } = require('../models');
const { generateMeetingSummary } = require('./aiSummaryService');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe audio file with speaker diarization
 * @param {string} audioUrl - S3 URL of the audio file
 * @param {string} transcriptId - ID of the transcript record
 * @param {string} meetingId - ID of the meeting record
 * @returns {Promise<Object>} Transcription result
 */
const transcribeAudio = async (audioUrl, transcriptId, meetingId) => {
  try {
    // Get transcript record
    const transcript = await Transcript.findByPk(transcriptId);
    if (!transcript) {
      throw new Error(`Transcript with ID ${transcriptId} not found`);
    }
    
    // Update transcript status to diarizing
    await transcript.update({
      processingStatus: 'diarizing'
    });
    
    // Extract S3 key from URL
    const s3Key = audioUrl.split('/').slice(3).join('/');
    
    // Get audio file from S3
    const audioData = await s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key
    }).promise();
    
    // Update transcript status to transcribing
    await transcript.update({
      processingStatus: 'transcribing'
    });
    
    console.log('Starting transcription with OpenAI Whisper...');
    
    // Use OpenAI Whisper API for transcription with diarization
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioData.Body,
      model: "whisper-1",
      response_format: "verbose_json",
      temperature: 0.2,
      language: "en",
      prompt: "This is a meeting with multiple speakers. Please identify different speakers."
    });
    
    // Process the transcription response
    const segments = transcriptionResponse.segments.map(segment => ({
      time: formatTimestamp(segment.start),
      speaker: `Speaker ${segment.speaker || 'Unknown'}`,
      text: segment.text.trim()
    }));
    
    // Update transcript with transcription result
    await transcript.update({
      processingStatus: 'completed',
      content: segments
    });
    
    // Update meeting status
    const meeting = await Meeting.findByPk(meetingId);
    if (meeting) {
      await meeting.update({
        status: 'completed'
      });
    }
    
    // Generate meeting summary asynchronously
    generateMeetingSummary(meetingId, segments)
      .catch(error => {
        console.error('Error generating meeting summary:', error);
      });
    
    return {
      transcriptId,
      meetingId,
      status: 'completed',
      segments: segments.length
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    // Update transcript with error status
    const transcript = await Transcript.findByPk(transcriptId);
    if (transcript) {
      await transcript.update({
        processingStatus: 'failed',
        processingError: error.message
      });
    }
    
    // Update meeting status
    const meeting = await Meeting.findByPk(meetingId);
    if (meeting) {
      await meeting.update({
        status: 'failed'
      });
    }
    
    throw error;
  }
};

/**
 * Format timestamp in HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Generate meeting notes from transcript
 * @param {string} transcriptId - ID of the transcript
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated meeting notes
 */
const generateMeetingNotes = async (transcriptId, options = {}) => {
  try {
    const transcript = await Transcript.findByPk(transcriptId, {
      include: [{ model: Meeting, as: 'meeting' }]
    });
    
    if (!transcript) {
      throw new Error('Transcript not found');
    }
    
    if (transcript.processingStatus !== 'completed') {
      throw new Error('Transcript processing not completed');
    }
    
    // Extract transcript content
    const transcriptContent = transcript.content;
    
    // Prepare transcript text for OpenAI
    const transcriptText = transcriptContent.map(entry => 
      `[${entry.time}] ${entry.speaker}: ${entry.text}`
    ).join('\n');
    
    // Determine meeting type
    const meetingType = options.meetingType || 'general';
    
    // Create system prompt based on meeting type
    let systemPrompt = 'You are an AI assistant that creates concise, accurate meeting notes. ';
    
    switch (meetingType) {
      case 'school':
        systemPrompt += 'Format the notes as a structured academic summary with key concepts, definitions, and important points.';
        break;
      case 'company':
        systemPrompt += 'Format the notes as a business summary with key decisions, action items, and responsibilities.';
        break;
      default:
        systemPrompt += 'Create a general summary with key points and action items.';
    }
    
    // Generate meeting notes using OpenAI
    const completion = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please create meeting notes from the following transcript:\n\n${transcriptText}` }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });
    
    // Extract the generated notes
    const generatedNotes = completion.choices[0].message.content;
    
    // Generate structured outline and action items
    const outlineCompletion = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        { role: 'system', content: 'Extract a structured outline and action items from meeting notes.' },
        { role: 'user', content: `Based on these meeting notes, create a JSON object with two properties: "outline" (an array of sections with title and items) and "actionItems" (an array of tasks with assignee and dueDate if mentioned):\n\n${generatedNotes}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });
    
    // Parse the structured data
    const structuredData = JSON.parse(outlineCompletion.choices[0].message.content);
    
    // Create meeting note in database
    const meetingNote = await MeetingNote.create({
      meetingId: transcript.meetingId,
      summary: generatedNotes,
      outline: structuredData.outline || [],
      actionItems: structuredData.actionItems || [],
      content: {
        summary: generatedNotes,
        outline: structuredData.outline || [],
        actionItems: structuredData.actionItems || []
      },
      format: 'markdown',
      aiGenerated: true
    });
    
    return meetingNote;
  } catch (error) {
    console.error('Error generating meeting notes:', error);
    throw error;
  }
};

module.exports = {
  transcribeAudio,
  generateMeetingNotes
};
