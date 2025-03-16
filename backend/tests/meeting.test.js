const request = require('supertest');
const { app } = require('../src/server');
const { Meeting, Transcript, User } = require('../src/models');

// Mock models
jest.mock('../src/models', () => ({
  Meeting: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Transcript: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  }
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: '123' })
}));

describe('Meeting Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMeeting = {
    id: '123',
    title: 'Test Meeting',
    description: 'Test Description',
    startTime: new Date(),
    endTime: new Date(),
    status: 'completed',
    createdBy: '123',
    updatedAt: new Date(),
    createdAt: new Date()
  };

  const mockTranscript = {
    id: '456',
    meetingId: '123',
    content: 'Test transcript content',
    processingStatus: 'completed',
    summary: 'Test summary'
  };

  describe('GET /api/meetings', () => {
    it('should return all meetings for the user', async () => {
      // Mock meetings retrieval
      Meeting.findAll.mockResolvedValue([mockMeeting]);

      const response = await request(app)
        .get('/api/meetings')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id', mockMeeting.id);
    });
  });

  describe('GET /api/meetings/:id', () => {
    it('should return a specific meeting with transcript', async () => {
      // Mock meeting and transcript retrieval
      Meeting.findOne.mockResolvedValue(mockMeeting);
      Transcript.findOne.mockResolvedValue(mockTranscript);

      const response = await request(app)
        .get('/api/meetings/123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockMeeting.id);
      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript).toHaveProperty('id', mockTranscript.id);
    });

    it('should return 404 if meeting not found', async () => {
      // Mock meeting not found
      Meeting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/meetings/999')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/meetings', () => {
    it('should create a new meeting', async () => {
      // Mock meeting creation
      Meeting.create.mockResolvedValue(mockMeeting);

      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'New Meeting',
          description: 'New Description',
          startTime: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', mockMeeting.id);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/meetings/:id', () => {
    it('should update an existing meeting', async () => {
      // Mock meeting retrieval and update
      Meeting.findOne.mockResolvedValue(mockMeeting);
      Meeting.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/meetings/123')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Updated Meeting',
          description: 'Updated Description'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Meeting updated successfully');
    });

    it('should return 404 if meeting not found', async () => {
      // Mock meeting not found
      Meeting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/meetings/999')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Updated Meeting'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/meetings/:id', () => {
    it('should delete an existing meeting', async () => {
      // Mock meeting retrieval and deletion
      Meeting.findOne.mockResolvedValue(mockMeeting);
      Meeting.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/meetings/123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Meeting deleted successfully');
    });

    it('should return 404 if meeting not found', async () => {
      // Mock meeting not found
      Meeting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/meetings/999')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
