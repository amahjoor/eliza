const axios = require('axios');
const { User } = require('../models');

/**
 * Base integration service with common methods
 */
class BaseIntegrationService {
  constructor(userId) {
    this.userId = userId;
  }
  
  /**
   * Get user integration settings
   * @returns {Promise<Object>} User integration settings
   */
  async getUserIntegrationSettings() {
    try {
      const user = await User.findByPk(this.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user.settings?.integrations || {};
    } catch (error) {
      console.error('Error getting user integration settings:', error);
      throw error;
    }
  }
  
  /**
   * Update user integration settings
   * @param {string} platform - Platform name
   * @param {Object} settings - Platform settings
   * @returns {Promise<Object>} Updated user integration settings
   */
  async updateIntegrationSettings(platform, settings) {
    try {
      const user = await User.findByPk(this.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get current settings
      const currentSettings = user.settings || {};
      const currentIntegrations = currentSettings.integrations || {};
      
      // Update settings
      await user.update({
        settings: {
          ...currentSettings,
          integrations: {
            ...currentIntegrations,
            [platform]: {
              ...(currentIntegrations[platform] || {}),
              ...settings
            }
          }
        }
      });
      
      return user.settings.integrations;
    } catch (error) {
      console.error(`Error updating ${platform} integration settings:`, error);
      throw error;
    }
  }
  
  /**
   * Remove integration
   * @param {string} platform - Platform name
   * @returns {Promise<Object>} Updated user integration settings
   */
  async removeIntegration(platform) {
    try {
      const user = await User.findByPk(this.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get current settings
      const currentSettings = user.settings || {};
      const currentIntegrations = currentSettings.integrations || {};
      
      // Remove platform settings
      const { [platform]: removed, ...remainingIntegrations } = currentIntegrations;
      
      // Update settings
      await user.update({
        settings: {
          ...currentSettings,
          integrations: remainingIntegrations
        }
      });
      
      return user.settings.integrations;
    } catch (error) {
      console.error(`Error removing ${platform} integration:`, error);
      throw error;
    }
  }
}

/**
 * Zoom integration service
 */
class ZoomIntegrationService extends BaseIntegrationService {
  constructor(userId) {
    super(userId);
    this.platform = 'zoom';
  }
  
  /**
   * Authenticate with Zoom
   * @param {string} code - OAuth code
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(code) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.ZOOM_REDIRECT_URI
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
        }
      });
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Get user info
      const userResponse = await axios.get('https://api.zoom.us/v2/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      const { id, email, first_name, last_name } = userResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        connected: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
        userId: id,
        email,
        firstName: first_name,
        lastName: last_name
      });
      
      return {
        connected: true,
        email,
        name: `${first_name} ${last_name}`
      };
    } catch (error) {
      console.error('Error authenticating with Zoom:', error);
      throw error;
    }
  }
  
  /**
   * Refresh Zoom access token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const zoomSettings = settings[this.platform];
      
      if (!zoomSettings || !zoomSettings.refreshToken) {
        throw new Error('Zoom refresh token not found');
      }
      
      // Exchange refresh token for new access token
      const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: zoomSettings.refreshToken
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
        }
      });
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      });
      
      return {
        accessToken: access_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error refreshing Zoom token:', error);
      
      // If refresh fails, mark as disconnected
      await this.updateIntegrationSettings(this.platform, {
        connected: false
      });
      
      throw error;
    }
  }
  
  /**
   * Get Zoom meetings
   * @returns {Promise<Array>} Meetings
   */
  async getMeetings() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const zoomSettings = settings[this.platform];
      
      if (!zoomSettings || !zoomSettings.connected) {
        throw new Error('Zoom not connected');
      }
      
      // Check if token is expired
      if (new Date(zoomSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meetings
      const response = await axios.get('https://api.zoom.us/v2/users/me/recordings', {
        headers: {
          Authorization: `Bearer ${zoomSettings.accessToken}`
        },
        params: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
          to: new Date().toISOString().split('T')[0]
        }
      });
      
      return response.data.meetings.map(meeting => ({
        id: meeting.uuid,
        name: meeting.topic,
        startTime: meeting.start_time,
        duration: meeting.duration,
        recordingCount: meeting.recording_count,
        recordingFiles: meeting.recording_files
      }));
    } catch (error) {
      console.error('Error getting Zoom meetings:', error);
      throw error;
    }
  }
  
  /**
   * Get Zoom meeting recording
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<Object>} Meeting recording
   */
  async getMeetingRecording(meetingId) {
    try {
      const settings = await this.getUserIntegrationSettings();
      const zoomSettings = settings[this.platform];
      
      if (!zoomSettings || !zoomSettings.connected) {
        throw new Error('Zoom not connected');
      }
      
      // Check if token is expired
      if (new Date(zoomSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meeting recording
      const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
        headers: {
          Authorization: `Bearer ${zoomSettings.accessToken}`
        }
      });
      
      return {
        id: response.data.uuid,
        name: response.data.topic,
        startTime: response.data.start_time,
        duration: response.data.duration,
        recordingFiles: response.data.recording_files
      };
    } catch (error) {
      console.error('Error getting Zoom meeting recording:', error);
      throw error;
    }
  }
}

/**
 * Microsoft Teams integration service
 */
class TeamsIntegrationService extends BaseIntegrationService {
  constructor(userId) {
    super(userId);
    this.platform = 'teams';
  }
  
  /**
   * Authenticate with Microsoft Teams
   * @param {string} code - OAuth code
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(code) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', 
        new URLSearchParams({
          client_id: process.env.TEAMS_CLIENT_ID,
          client_secret: process.env.TEAMS_CLIENT_SECRET,
          code,
          redirect_uri: process.env.TEAMS_REDIRECT_URI,
          grant_type: 'authorization_code'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Get user info
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      const { id, displayName, mail } = userResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        connected: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
        userId: id,
        email: mail,
        displayName
      });
      
      return {
        connected: true,
        email: mail,
        name: displayName
      };
    } catch (error) {
      console.error('Error authenticating with Microsoft Teams:', error);
      throw error;
    }
  }
  
  /**
   * Refresh Microsoft Teams access token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const teamsSettings = settings[this.platform];
      
      if (!teamsSettings || !teamsSettings.refreshToken) {
        throw new Error('Microsoft Teams refresh token not found');
      }
      
      // Exchange refresh token for new access token
      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', 
        new URLSearchParams({
          client_id: process.env.TEAMS_CLIENT_ID,
          client_secret: process.env.TEAMS_CLIENT_SECRET,
          refresh_token: teamsSettings.refreshToken,
          grant_type: 'refresh_token'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      });
      
      return {
        accessToken: access_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error refreshing Microsoft Teams token:', error);
      
      // If refresh fails, mark as disconnected
      await this.updateIntegrationSettings(this.platform, {
        connected: false
      });
      
      throw error;
    }
  }
  
  /**
   * Get Microsoft Teams meetings
   * @returns {Promise<Array>} Meetings
   */
  async getMeetings() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const teamsSettings = settings[this.platform];
      
      if (!teamsSettings || !teamsSettings.connected) {
        throw new Error('Microsoft Teams not connected');
      }
      
      // Check if token is expired
      if (new Date(teamsSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meetings
      const response = await axios.get('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
        headers: {
          Authorization: `Bearer ${teamsSettings.accessToken}`
        }
      });
      
      return response.data.value.map(meeting => ({
        id: meeting.id,
        name: meeting.subject,
        startTime: meeting.startDateTime,
        endTime: meeting.endDateTime,
        joinUrl: meeting.joinUrl
      }));
    } catch (error) {
      console.error('Error getting Microsoft Teams meetings:', error);
      throw error;
    }
  }
  
  /**
   * Get Microsoft Teams meeting recording
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<Object>} Meeting recording
   */
  async getMeetingRecording(meetingId) {
    try {
      const settings = await this.getUserIntegrationSettings();
      const teamsSettings = settings[this.platform];
      
      if (!teamsSettings || !teamsSettings.connected) {
        throw new Error('Microsoft Teams not connected');
      }
      
      // Check if token is expired
      if (new Date(teamsSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meeting recording
      const response = await axios.get(`https://graph.microsoft.com/v1.0/me/onlineMeetings/${meetingId}/recordings`, {
        headers: {
          Authorization: `Bearer ${teamsSettings.accessToken}`
        }
      });
      
      if (response.data.value.length === 0) {
        throw new Error('No recordings found for this meeting');
      }
      
      return {
        id: meetingId,
        recordings: response.data.value.map(recording => ({
          id: recording.id,
          name: recording.name,
          createdDateTime: recording.createdDateTime,
          recordingContentUrl: recording.recordingContentUrl
        }))
      };
    } catch (error) {
      console.error('Error getting Microsoft Teams meeting recording:', error);
      throw error;
    }
  }
}

/**
 * Google Meet integration service
 */
class GoogleMeetIntegrationService extends BaseIntegrationService {
  constructor(userId) {
    super(userId);
    this.platform = 'googleMeet';
  }
  
  /**
   * Authenticate with Google Meet
   * @param {string} code - OAuth code
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(code) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      });
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Get user info
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      const { sub, email, name } = userResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        connected: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
        userId: sub,
        email,
        name
      });
      
      return {
        connected: true,
        email,
        name
      };
    } catch (error) {
      console.error('Error authenticating with Google Meet:', error);
      throw error;
    }
  }
  
  /**
   * Refresh Google Meet access token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const googleMeetSettings = settings[this.platform];
      
      if (!googleMeetSettings || !googleMeetSettings.refreshToken) {
        throw new Error('Google Meet refresh token not found');
      }
      
      // Exchange refresh token for new access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: googleMeetSettings.refreshToken,
        grant_type: 'refresh_token'
      });
      
      const { access_token, expires_in } = tokenResponse.data;
      
      // Update user integration settings
      await this.updateIntegrationSettings(this.platform, {
        accessToken: access_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      });
      
      return {
        accessToken: access_token,
        expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error refreshing Google Meet token:', error);
      
      // If refresh fails, mark as disconnected
      await this.updateIntegrationSettings(this.platform, {
        connected: false
      });
      
      throw error;
    }
  }
  
  /**
   * Get Google Meet meetings
   * @returns {Promise<Array>} Meetings
   */
  async getMeetings() {
    try {
      const settings = await this.getUserIntegrationSettings();
      const googleMeetSettings = settings[this.platform];
      
      if (!googleMeetSettings || !googleMeetSettings.connected) {
        throw new Error('Google Meet not connected');
      }
      
      // Check if token is expired
      if (new Date(googleMeetSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meetings from Google Calendar
      const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: {
          Authorization: `Bearer ${googleMeetSettings.accessToken}`
        },
        params: {
          timeMin: new Date().toISOString(),
          maxResults: 100,
          singleEvents: true,
          orderBy: 'startTime'
        }
      });
      
      // Filter events with Google Meet conferencing
      return response.data.items
        .filter(event => event.conferenceData?.conferenceId)
        .map(event => ({
          id: event.id,
          name: event.summary,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          conferenceId: event.conferenceData.conferenceId,
          joinUrl: event.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video')?.uri
        }));
    } catch (error) {
      console.error('Error getting Google Meet meetings:', error);
      throw error;
    }
  }
  
  /**
   * Get Google Meet meeting recording
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<Object>} Meeting recording
   */
  async getMeetingRecording(meetingId) {
    try {
      const settings = await this.getUserIntegrationSettings();
      const googleMeetSettings = settings[this.platform];
      
      if (!googleMeetSettings || !googleMeetSettings.connected) {
        throw new Error('Google Meet not connected');
      }
      
      // Check if token is expired
      if (new Date(googleMeetSettings.expiresAt) <= new Date()) {
        await this.refreshToken();
      }
      
      // Get meeting recording from Google Drive
      // Note: This requires the user to have saved the recording to their Google Drive
      const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: {
          Authorization: `Bearer ${googleMeetSettings.accessToken}`
        },
        params: {
          q: `name contains 'Meet Recording' and mimeType contains 'video/'`,
          fields: 'files(id, name, webViewLink, createdTime, size, videoMediaMetadata)'
        }
      });
      
      return {
        id: meetingId,
        recordings: response.data.files.map(file => ({
          id: file.id,
          name: file.name,
          createdTime: file.createdTime,
          webViewLink: file.webViewLink,
          downloadUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          size: file.size,
          duration: file.videoMediaMetadata?.durationMillis
        }))
      };
    } catch (error) {
      console.error('Error getting Google Meet meeting recording:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create integration service
 * @param {string} platform - Platform name
 * @param {string} userId - User ID
 * @returns {Object} Integration service
 */
const createIntegrationService = (platform, userId) => {
  switch (platform) {
    case 'zoom':
      return new ZoomIntegrationService(userId);
    case 'teams':
      return new TeamsIntegrationService(userId);
    case 'googleMeet':
      return new GoogleMeetIntegrationService(userId);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

module.exports = {
  createIntegrationService,
  ZoomIntegrationService,
  TeamsIntegrationService,
  GoogleMeetIntegrationService
};
