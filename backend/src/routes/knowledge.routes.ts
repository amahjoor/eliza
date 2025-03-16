import express from 'express';
import { 
  extractKnowledgeController,
  generateConnectionsController,
  searchKnowledgeController,
  getKnowledgeGraphController
} from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Knowledge extraction
router.post('/extract/:meetingId', extractKnowledgeController);

// Knowledge connections
router.post('/connections', generateConnectionsController);

// Knowledge search
router.post('/search', searchKnowledgeController);

// Knowledge graph
router.get('/graph', getKnowledgeGraphController);

export default router;
