/**
 * Socket.io service for real-time updates
 * Provides methods to emit events to clients
 */

/**
 * Emit transcript update to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} data - Transcript data
 */
const emitTranscriptUpdate = (io, meetingId, data) => {
  io.to(`meeting-${meetingId}`).emit(`transcript-update-${meetingId}`, data);
};

/**
 * Emit meeting note update to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} data - Meeting note data
 */
const emitNoteUpdate = (io, meetingId, data) => {
  io.to(`meeting-${meetingId}`).emit(`note-update-${meetingId}`, data);
};

/**
 * Emit meeting status update to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} data - Meeting status data
 */
const emitStatusUpdate = (io, meetingId, data) => {
  io.to(`meeting-${meetingId}`).emit(`status-update-${meetingId}`, data);
};

/**
 * Emit transcription progress update to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} data - Transcription progress data
 */
const emitTranscriptionProgress = (io, meetingId, data) => {
  io.to(`meeting-${meetingId}`).emit(`transcription-progress-${meetingId}`, data);
};

/**
 * Emit summary generation progress update to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} data - Summary generation progress data
 */
const emitSummaryProgress = (io, meetingId, data) => {
  io.to(`meeting-${meetingId}`).emit(`summary-progress-${meetingId}`, data);
};

/**
 * Emit error to clients in a meeting room
 * @param {Object} io - Socket.io instance
 * @param {string} meetingId - Meeting ID
 * @param {Object} error - Error data
 */
const emitError = (io, meetingId, error) => {
  io.to(`meeting-${meetingId}`).emit(`error-${meetingId}`, error);
};

module.exports = {
  emitTranscriptUpdate,
  emitNoteUpdate,
  emitStatusUpdate,
  emitTranscriptionProgress,
  emitSummaryProgress,
  emitError
};
