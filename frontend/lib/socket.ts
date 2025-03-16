import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket.io client
 * @returns {Socket} Socket.io client instance
 */
export const initializeSocket = (): Socket => {
  if (!socket) {
    // Connect to the server
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
    });
  }

  return socket;
};

/**
 * Get the Socket.io client instance
 * @returns {Socket|null} Socket.io client instance or null if not initialized
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Join a meeting room
 * @param {string} meetingId - Meeting ID to join
 */
export const joinMeeting = (meetingId: string): void => {
  if (socket) {
    socket.emit('join-meeting', meetingId);
  }
};

/**
 * Leave a meeting room
 * @param {string} meetingId - Meeting ID to leave
 */
export const leaveMeeting = (meetingId: string): void => {
  if (socket) {
    socket.emit('leave-meeting', meetingId);
  }
};

/**
 * Subscribe to transcript updates
 * @param {string} meetingId - Meeting ID to subscribe to
 * @param {Function} callback - Callback function to handle transcript updates
 */
export const subscribeToTranscriptUpdates = (
  meetingId: string,
  callback: (data: any) => void
): void => {
  if (socket) {
    socket.on(`transcript-update-${meetingId}`, callback);
  }
};

/**
 * Subscribe to meeting note updates
 * @param {string} meetingId - Meeting ID to subscribe to
 * @param {Function} callback - Callback function to handle meeting note updates
 */
export const subscribeToNoteUpdates = (
  meetingId: string,
  callback: (data: any) => void
): void => {
  if (socket) {
    socket.on(`note-update-${meetingId}`, callback);
  }
};

/**
 * Subscribe to meeting status updates
 * @param {string} meetingId - Meeting ID to subscribe to
 * @param {Function} callback - Callback function to handle meeting status updates
 */
export const subscribeToStatusUpdates = (
  meetingId: string,
  callback: (data: any) => void
): void => {
  if (socket) {
    socket.on(`status-update-${meetingId}`, callback);
  }
};

/**
 * Unsubscribe from all meeting events
 * @param {string} meetingId - Meeting ID to unsubscribe from
 */
export const unsubscribeFromMeetingEvents = (meetingId: string): void => {
  if (socket) {
    socket.off(`transcript-update-${meetingId}`);
    socket.off(`note-update-${meetingId}`);
    socket.off(`status-update-${meetingId}`);
  }
};

/**
 * Disconnect Socket.io client
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  joinMeeting,
  leaveMeeting,
  subscribeToTranscriptUpdates,
  subscribeToNoteUpdates,
  subscribeToStatusUpdates,
  unsubscribeFromMeetingEvents,
  disconnectSocket
};
