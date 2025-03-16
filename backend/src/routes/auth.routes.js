const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Import error classes
const { AuthenticationError } = require('../middleware/errorHandler');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (err) {
      throw new AuthenticationError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

// Import email service
const { 
  generateVerificationToken, 
  sendVerificationEmail 
} = require('../services/emailService');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { ValidationError } = require('../middleware/errorHandler');
    const { firstName, lastName, email, password, userType } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      throw new ValidationError('All fields are required', {
        firstName: !firstName ? 'First name is required' : null,
        lastName: !lastName ? 'Last name is required' : null,
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', {
        email: 'Please enter a valid email address'
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password is too weak', {
        password: 'Password must be at least 8 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('User already exists', {
        email: 'Email is already registered'
      });
    }
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed in the model hook
      userType: userType || 'professional',
      isEmailVerified: false
    });
    
    // Generate verification token
    const verificationToken = generateVerificationToken(user.id, user.email);
    
    // Send verification email
    if (process.env.NODE_ENV !== 'test') {
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Continue with registration even if email fails
      }
    }
    
    // Generate auth token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { ValidationError, AuthenticationError } = require('../middleware/errorHandler');
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      throw new ValidationError('All fields are required', {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      });
    }
    
    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Check password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const { NotFoundError } = require('../middleware/errorHandler');
    
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// @route   PUT api/auth/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update settings
    user.settings = {
      ...user.settings,
      ...settings
    };
    
    await user.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, profilePicture } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profilePicture) user.profilePicture = profilePicture;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { ValidationError } = require('../middleware/errorHandler');
    const { generatePasswordResetToken, sendPasswordResetEmail } = require('../services/emailService');
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email is required', { email: 'Email is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate password reset token
    const resetToken = generatePasswordResetToken(user.id, user.email);
    
    // Send password reset email
    if (process.env.NODE_ENV !== 'test') {
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        throw new Error('Failed to send password reset email');
      }
    }
    
    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (err) {
    next(err);
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset user password with token
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  try {
    const { ValidationError, AuthenticationError } = require('../middleware/errorHandler');
    const { verifyToken } = require('../services/emailService');
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required', {
        token: !token ? 'Token is required' : null,
        newPassword: !newPassword ? 'New password is required' : null
      });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new ValidationError('Password is too weak', {
        newPassword: 'Password must be at least 8 characters long'
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
      
      // Check if token is for password reset
      if (decoded.purpose !== 'password_reset') {
        throw new AuthenticationError('Invalid token purpose');
      }
    } catch (tokenError) {
      throw new AuthenticationError('Invalid or expired token');
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.email !== decoded.email) {
      throw new AuthenticationError('Invalid token');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   GET api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.get('/verify-email', async (req, res, next) => {
  try {
    const { AuthenticationError } = require('../middleware/errorHandler');
    const { verifyToken } = require('../services/emailService');
    const { token } = req.query;
    
    if (!token) {
      throw new AuthenticationError('Token is required');
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      throw new AuthenticationError('Invalid or expired token');
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.email !== decoded.email) {
      throw new AuthenticationError('Invalid token');
    }
    
    // Update email verification status
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    next(err);
  }
});

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', verifyToken, async (req, res, next) => {
  try {
    const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');
    
    // Find user
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.json({ message: 'Email is already verified' });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken(user.id, user.email);
    
    // Send verification email
    if (process.env.NODE_ENV !== 'test') {
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        throw new Error('Failed to send verification email');
      }
    }
    
    res.json({ message: 'Verification email sent successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
