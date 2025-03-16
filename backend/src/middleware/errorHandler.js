/**
 * Global error handling middleware
 * Centralizes error handling logic for consistent error responses
 */

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
class ValidationError extends APIError {
  constructor(message, details) {
    super(message, 400, details);
    this.name = this.constructor.name;
  }
}

// Not found error class
class NotFoundError extends APIError {
  constructor(message) {
    super(message, 404);
    this.name = this.constructor.name;
  }
}

// Authentication error class
class AuthenticationError extends APIError {
  constructor(message) {
    super(message, 401);
    this.name = this.constructor.name;
  }
}

// Authorization error class
class AuthorizationError extends APIError {
  constructor(message) {
    super(message, 403);
    this.name = this.constructor.name;
  }
}

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;
  
  // Handle specific error types
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    // Handle Sequelize validation errors
    statusCode = 400;
    message = 'Validation error';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // Handle JWT errors
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // Handle JSON parsing errors
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  
  // Log detailed error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error details:', err.stack);
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

// Export error classes and middleware
module.exports = {
  errorHandler,
  APIError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError
};
