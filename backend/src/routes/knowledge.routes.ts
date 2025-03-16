import express from 'express';
import { 
  getAllKnowledgeEntries,
  getKnowledgeEntryById,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  generateKnowledgeFromMeeting,
  getKnowledgeGraph
} from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as express.RequestHandler);

// Knowledge entry CRUD routes
router.get('/', getAllKnowledgeEntries as express.RequestHandler);
router.get('/entry/:id', getKnowledgeEntryById as express.RequestHandler);
router.post('/entry', createKnowledgeEntry as express.RequestHandler);
router.put('/entry/:id', updateKnowledgeEntry as express.RequestHandler);
router.delete('/entry/:id', deleteKnowledgeEntry as express.RequestHandler);

// Knowledge generation routes
router.post('/generate/meeting/:meetingId', generateKnowledgeFromMeeting as express.RequestHandler);
router.get('/graph', getKnowledgeGraph as express.RequestHandler);

export default router;
