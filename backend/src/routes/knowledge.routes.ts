import express from 'express';
import { 
  getAllKnowledgeEntries,
  getKnowledgeEntryById,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  generateKnowledgeFromMeeting,
  getKnowledgeBaseSummary,
  getKnowledgeGraph
} from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Knowledge entry routes
router.get('/', getAllKnowledgeEntries);
router.get('/entry/:id', getKnowledgeEntryById);
router.post('/entry', createKnowledgeEntry);
router.put('/entry/:id', updateKnowledgeEntry);
router.delete('/entry/:id', deleteKnowledgeEntry);

// Knowledge generation routes
router.post('/generate/meeting/:meetingId', generateKnowledgeFromMeeting);

// Knowledge base summary
router.get('/summary', getKnowledgeBaseSummary);

// Knowledge graph visualization data
router.get('/graph', getKnowledgeGraph);

export default router;
