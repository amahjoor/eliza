const express = require('express');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET api/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'settings']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      settings: user.settings || {}
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

/**
 * @route   PUT api/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user settings
    await user.update({
      settings: {
        ...user.settings,
        ...settings
      }
    });
    
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

/**
 * @route   PUT api/settings/notifications
 * @desc    Update notification settings
 * @access  Private
 */
router.put('/notifications', async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!notifications) {
      return res.status(400).json({ error: 'Notifications object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update notification settings
    await user.update({
      settings: {
        ...user.settings,
        notifications: {
          ...(user.settings?.notifications || {}),
          ...notifications
        }
      }
    });
    
    res.status(200).json({
      id: user.id,
      settings: {
        notifications: user.settings.notifications
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

/**
 * @route   PUT api/settings/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
router.put('/privacy', async (req, res) => {
  try {
    const { privacy } = req.body;
    
    if (!privacy) {
      return res.status(400).json({ error: 'Privacy object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update privacy settings
    await user.update({
      settings: {
        ...user.settings,
        privacy: {
          ...(user.settings?.privacy || {}),
          ...privacy
        }
      }
    });
    
    res.status(200).json({
      id: user.id,
      settings: {
        privacy: user.settings.privacy
      }
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

/**
 * @route   PUT api/settings/meetings
 * @desc    Update meeting preferences
 * @access  Private
 */
router.put('/meetings', async (req, res) => {
  try {
    const { meetings } = req.body;
    
    if (!meetings) {
      return res.status(400).json({ error: 'Meetings object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update meeting preferences
    await user.update({
      settings: {
        ...user.settings,
        meetings: {
          ...(user.settings?.meetings || {}),
          ...meetings
        }
      }
    });
    
    res.status(200).json({
      id: user.id,
      settings: {
        meetings: user.settings.meetings
      }
    });
  } catch (error) {
    console.error('Error updating meeting preferences:', error);
    res.status(500).json({ error: 'Failed to update meeting preferences' });
  }
});

/**
 * @route   PUT api/settings/appearance
 * @desc    Update appearance settings
 * @access  Private
 */
router.put('/appearance', async (req, res) => {
  try {
    const { appearance } = req.body;
    
    if (!appearance) {
      return res.status(400).json({ error: 'Appearance object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update appearance settings
    await user.update({
      settings: {
        ...user.settings,
        appearance: {
          ...(user.settings?.appearance || {}),
          ...appearance
        }
      }
    });
    
    res.status(200).json({
      id: user.id,
      settings: {
        appearance: user.settings.appearance
      }
    });
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    res.status(500).json({ error: 'Failed to update appearance settings' });
  }
});

/**
 * @route   PUT api/settings/integrations
 * @desc    Update integration settings
 * @access  Private
 */
router.put('/integrations', async (req, res) => {
  try {
    const { integrations } = req.body;
    
    if (!integrations) {
      return res.status(400).json({ error: 'Integrations object is required' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update integration settings
    await user.update({
      settings: {
        ...user.settings,
        integrations: {
          ...(user.settings?.integrations || {}),
          ...integrations
        }
      }
    });
    
    res.status(200).json({
      id: user.id,
      settings: {
        integrations: user.settings.integrations
      }
    });
  } catch (error) {
    console.error('Error updating integration settings:', error);
    res.status(500).json({ error: 'Failed to update integration settings' });
  }
});

module.exports = router;
