const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('./errorHandler');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Access denied. No token provided.');
    }
    
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
};

module.exports = {
  authenticateToken
};
