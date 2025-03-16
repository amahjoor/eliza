const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Generate verification token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Verification token
 */
const generateVerificationToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_EMAIL_SECRET || process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Password reset token
 */
const generatePasswordResetToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email, purpose: 'password_reset' },
    process.env.JWT_EMAIL_SECRET || process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Verify token
 * @param {string} token - Token to verify
 * @returns {Object} Decoded token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_EMAIL_SECRET || process.env.JWT_SECRET);
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Email send result
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Eliza.ai" <${process.env.EMAIL_FROM || 'noreply@eliza.ai'}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Eliza.ai!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't sign up for Eliza.ai, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eliza.ai. All rights reserved.</p>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Password reset token
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Eliza.ai" <${process.env.EMAIL_FROM || 'noreply@eliza.ai'}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eliza.ai. All rights reserved.</p>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  sendVerificationEmail,
  sendPasswordResetEmail
};
