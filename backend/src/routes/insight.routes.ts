import express from 'express';
import { 
  generatePersonInsightsController,
  generateProjectInsightsController,
  generateMeetingInsightsController
} from '../controllers/insight.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Insight generation routes
router.post('/person/:personId', generatePersonInsightsController);
router.post('/project/:projectId', generateProjectInsightsController);
router.post('/meeting/:meetingId', generateMeetingInsightsController);

export default router;
