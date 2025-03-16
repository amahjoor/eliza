const request = require('supertest');
const { app } = require('../src/server');
const { User } = require('../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateVerificationToken } = require('../src/services/emailService');

// Mock User model
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ id: '123', email: 'test@example.com' })
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn()
}));

// Mock email service
jest.mock('../src/services/emailService', () => ({
  generateVerificationToken: jest.fn().mockReturnValue('verification-token'),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  generatePasswordResetToken: jest.fn().mockReturnValue('reset-token'),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  verifyToken: jest.fn().mockReturnValue({ id: '123', email: 'test@example.com' })
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      // Mock user creation
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: '123',
        ...validUser,
        password: 'hashed-password',
        isEmailVerified: false
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token', 'test-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', '123');
      expect(response.body.user).toHaveProperty('email', validUser.email);
      expect(generateVerificationToken).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      // Mock existing user
      User.findOne.mockResolvedValue({ id: '123', email: validUser.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock user and password validation
      User.findOne.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        isValidPassword: jest.fn().mockResolvedValue(true)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'test-token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with invalid credentials', async () => {
      // Mock user with invalid password
      User.findOne.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        isValidPassword: jest.fn().mockResolvedValue(false)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      // Mock user retrieval
      User.findByPk.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '123');
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 with invalid token', async () => {
      // Mock JWT verification failure
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      // Mock user retrieval
      User.findOne.mockResolvedValue({
        id: '123',
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should not reveal if user does not exist', async () => {
      // Mock user not found
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
