import request from 'supertest';
import express from 'express';
import { Meeting, MeetingNote, Transcript, Person, Project } from '../models';
import searchRoutes from '../routes/search.routes';
import { authenticate } from '../middleware/auth.middleware';

// Mock dependencies
jest.mock('../models', () => ({
  Meeting: {
    findAll: jest.fn()
  },
  MeetingNote: {
    findAll: jest.fn()
  },
  Transcript: {
    findAll: jest.fn()
  },
  Person: {
    findAll: jest.fn()
  },
  Project: {
    findAll: jest.fn()
  }
}));

// Mock authentication middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com', role: 'user' };
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);

describe('Search Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return search results from all types', async () => {
      // Mock search results
      const mockMeetings = [{ id: 1, name: 'Test Meeting' }];
      const mockNotes = [{ id: 1, title: 'Test Note' }];
      const mockTranscripts = [{ id: 1, content: 'Test Transcript' }];
      const mockPeople = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
      const mockProjects = [{ id: 1, name: 'Test Project' }];

      // Setup mocks
      (Meeting.findAll as jest.Mock).mockResolvedValue(mockMeetings);
      (MeetingNote.findAll as jest.Mock).mockResolvedValue(mockNotes);
      (Transcript.findAll as jest.Mock).mockResolvedValue(mockTranscripts);
      (Person.findAll as jest.Mock).mockResolvedValue(mockPeople);
      (Project.findAll as jest.Mock).mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/api/search?query=test');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('meetings', mockMeetings);
      expect(response.body).toHaveProperty('notes', mockNotes);
      expect(response.body).toHaveProperty('transcripts', mockTranscripts);
      expect(response.body).toHaveProperty('people', mockPeople);
      expect(response.body).toHaveProperty('projects', mockProjects);
    });

    it('should return results for a specific type when type is specified', async () => {
      // Mock search results
      const mockMeetings = [{ id: 1, name: 'Test Meeting' }];

      // Setup mocks
      (Meeting.findAll as jest.Mock).mockResolvedValue(mockMeetings);

      const response = await request(app)
        .get('/api/search?query=test&type=meetings');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('meetings', mockMeetings);
      expect(response.body).not.toHaveProperty('notes');
      expect(response.body).not.toHaveProperty('transcripts');
      expect(response.body).not.toHaveProperty('people');
      expect(response.body).not.toHaveProperty('projects');
    });

    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Search query is required');
    });

    it('should apply limit and offset parameters', async () => {
      // Mock search results
      const mockMeetings = [{ id: 1, name: 'Test Meeting' }];

      // Setup mocks
      (Meeting.findAll as jest.Mock).mockResolvedValue(mockMeetings);
      (MeetingNote.findAll as jest.Mock).mockResolvedValue([]);
      (Transcript.findAll as jest.Mock).mockResolvedValue([]);
      (Person.findAll as jest.Mock).mockResolvedValue([]);
      (Project.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/search?query=test&limit=5&offset=10');

      expect(response.status).toBe(200);
      
      // Verify limit and offset were applied
      expect(Meeting.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 10
        })
      );
    });
  });
});
