// Test setup file for backend tests

// Import environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Mock database connection
jest.mock('../src/config/database', () => {
  return {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockReturnValue({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      hasOne: jest.fn(),
      belongsToMany: jest.fn()
    })
  };
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Global test teardown
afterAll(async () => {
  // Clean up any resources
  jest.clearAllMocks();
});
