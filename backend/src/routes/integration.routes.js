const express = require('express');
const { createIntegrationService } = require('../services/integrationService');
const { authenticateToken } = require('../middleware/auth');
const { processExternalMeeting } = require('../services/audioProcessing');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET api/integration/settings
 * @desc    Get all integration settings
 * @access  Private
 */
router.get('/settings', async (req, res) => {
  try {
    const { User } = require('../models');
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user.settings?.integrations || {});
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    res.status(500).json({ error: 'Failed to fetch integration settings' });
  }
});

/**
 * @route   GET api/integration/:platform/auth-url
 * @desc    Get OAuth URL for platform
 * @access  Private
 */
router.get('/:platform/auth-url', (req, res) => {
  try {
    const { platform } = req.params;
    
    let authUrl;
    
    switch (platform) {
      case 'zoom':
        authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI)}`;
        break;
      case 'teams':
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.TEAMS_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.TEAMS_REDIRECT_URI)}&response_mode=query&scope=offline_access%20user.read%20OnlineMeetings.Read`;
        break;
      case 'googleMeet':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly%20https://www.googleapis.com/auth/drive.readonly%20profile%20email`;
        break;
      default:
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }
    
    res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

/**
 * @route   POST api/integration/:platform/auth
 * @desc    Authenticate with platform
 * @access  Private
 */
router.post('/:platform/auth', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const integrationService = createIntegrationService(platform, req.user.id);
    const result = await integrationService.authenticate(code);
    
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error authenticating with ${req.params.platform}:`, error);
    res.status(500).json({ error: `Failed to authenticate with ${req.params.platform}` });
  }
});

/**
 * @route   DELETE api/integration/:platform
 * @desc    Remove platform integration
 * @access  Private
 */
router.delete('/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    
    const integrationService = createIntegrationService(platform, req.user.id);
    const result = await integrationService.removeIntegration(platform);
    
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error removing ${req.params.platform} integration:`, error);
    res.status(500).json({ error: `Failed to remove ${req.params.platform} integration` });
  }
});

/**
 * @route   GET api/integration/:platform/meetings
 * @desc    Get meetings from platform
 * @access  Private
 */
router.get('/:platform/meetings', async (req, res) => {
  try {
    const { platform } = req.params;
    
    const integrationService = createIntegrationService(platform, req.user.id);
    const meetings = await integrationService.getMeetings();
    
    res.status(200).json(meetings);
  } catch (error) {
    console.error(`Error getting ${req.params.platform} meetings:`, error);
    res.status(500).json({ error: `Failed to get ${req.params.platform} meetings` });
  }
});

/**
 * @route   GET api/integration/:platform/meetings/:meetingId
 * @desc    Get meeting recording from platform
 * @access  Private
 */
router.get('/:platform/meetings/:meetingId', async (req, res) => {
  try {
    const { platform, meetingId } = req.params;
    
    const integrationService = createIntegrationService(platform, req.user.id);
    const recording = await integrationService.getMeetingRecording(meetingId);
    
    res.status(200).json(recording);
  } catch (error) {
    console.error(`Error getting ${req.params.platform} meeting recording:`, error);
    res.status(500).json({ error: `Failed to get ${req.params.platform} meeting recording` });
  }
});

/**
 * @route   POST api/integration/:platform/meetings/:meetingId/process
 * @desc    Process meeting recording from platform
 * @access  Private
 */
router.post('/:platform/meetings/:meetingId/process', async (req, res) => {
  try {
    const { platform, meetingId } = req.params;
    
    const integrationService = createIntegrationService(platform, req.user.id);
    const recording = await integrationService.getMeetingRecording(meetingId);
    
    if (!recording) {
      return res.status(404).json({ error: 'Meeting recording not found' });
    }
    
    // Process the meeting recording
    const result = await processExternalMeeting(recording, platform, req.user.id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error processing ${req.params.platform} meeting recording:`, error);
    res.status(500).json({ error: `Failed to process ${req.params.platform} meeting recording` });
  }
});

module.exports = router;
