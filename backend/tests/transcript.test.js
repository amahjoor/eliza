const request = require('supertest');
const { app } = require('../src/server');
const { Transcript, Meeting } = require('../src/models');

// Mock models
jest.mock('../src/models', () => ({
  Transcript: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  Meeting: {
    findOne: jest.fn(),
    findByPk: jest.fn()
  }
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: '123' })
}));

describe('Transcript Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMeeting = {
    id: '123',
    title: 'Test Meeting',
    createdBy: '123'
  };

  const mockTranscript = {
    id: '456',
    meetingId: '123',
    content: 'Test transcript content',
    processingStatus: 'completed',
    summary: 'Test summary',
    segments: [
      {
        id: '1',
        start: 0,
        end: 10,
        text: 'Hello, this is a test.',
        speaker: 'Speaker 1'
      },
      {
        id: '2',
        start: 11,
        end: 20,
        text: 'Yes, this is a test transcript.',
        speaker: 'Speaker 2'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('GET /api/transcripts/meeting/:meetingId', () => {
    it('should return transcript for a specific meeting', async () => {
      // Mock meeting and transcript retrieval
      Meeting.findOne.mockResolvedValue(mockMeeting);
      Transcript.findOne.mockResolvedValue(mockTranscript);

      const response = await request(app)
        .get('/api/transcripts/meeting/123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockTranscript.id);
      expect(response.body).toHaveProperty('content', mockTranscript.content);
      expect(response.body).toHaveProperty('segments');
      expect(Array.isArray(response.body.segments)).toBe(true);
    });

    it('should return 404 if transcript not found', async () => {
      // Mock meeting found but transcript not found
      Meeting.findOne.mockResolvedValue(mockMeeting);
      Transcript.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transcripts/meeting/123')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if meeting not found', async () => {
      // Mock meeting not found
      Meeting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transcripts/meeting/999')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/transcripts/:id', () => {
    it('should update an existing transcript', async () => {
      // Mock transcript retrieval and update
      Transcript.findOne.mockResolvedValue({
        ...mockTranscript,
        getMeeting: jest.fn().mockResolvedValue(mockMeeting)
      });
      Transcript.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/transcripts/456')
        .set('Authorization', 'Bearer test-token')
        .send({
          summary: 'Updated summary',
          segments: [
            {
              id: '1',
              text: 'Updated text',
              speaker: 'Speaker 1'
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Transcript updated successfully');
    });

    it('should return 404 if transcript not found', async () => {
      // Mock transcript not found
      Transcript.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/transcripts/999')
        .set('Authorization', 'Bearer test-token')
        .send({
          summary: 'Updated summary'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/transcripts/:id/segments', () => {
    it('should return segments for a specific transcript', async () => {
      // Mock transcript retrieval
      Transcript.findOne.mockResolvedValue({
        ...mockTranscript,
        getMeeting: jest.fn().mockResolvedValue(mockMeeting)
      });

      const response = await request(app)
        .get('/api/transcripts/456/segments')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockTranscript.segments.length);
      expect(response.body[0]).toHaveProperty('id', mockTranscript.segments[0].id);
    });

    it('should return 404 if transcript not found', async () => {
      // Mock transcript not found
      Transcript.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transcripts/999/segments')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/transcripts/:id/segments/:segmentId', () => {
    it('should update a specific segment', async () => {
      // Mock transcript retrieval and update
      const mockTranscriptWithMethods = {
        ...mockTranscript,
        getMeeting: jest.fn().mockResolvedValue(mockMeeting),
        segments: [
          {
            id: '1',
            start: 0,
            end: 10,
            text: 'Hello, this is a test.',
            speaker: 'Speaker 1'
          }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      
      Transcript.findOne.mockResolvedValue(mockTranscriptWithMethods);

      const response = await request(app)
        .put('/api/transcripts/456/segments/1')
        .set('Authorization', 'Bearer test-token')
        .send({
          text: 'Updated segment text',
          speaker: 'Updated Speaker'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Segment updated successfully');
      expect(mockTranscriptWithMethods.save).toHaveBeenCalled();
    });

    it('should return 404 if segment not found', async () => {
      // Mock transcript found but segment not found
      const mockTranscriptWithMethods = {
        ...mockTranscript,
        getMeeting: jest.fn().mockResolvedValue(mockMeeting),
        segments: [
          {
            id: '1',
            start: 0,
            end: 10,
            text: 'Hello, this is a test.',
            speaker: 'Speaker 1'
          }
        ]
      };
      
      Transcript.findOne.mockResolvedValue(mockTranscriptWithMethods);

      const response = await request(app)
        .put('/api/transcripts/456/segments/999')
        .set('Authorization', 'Bearer test-token')
        .send({
          text: 'Updated segment text'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
