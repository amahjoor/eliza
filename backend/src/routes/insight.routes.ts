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

// Person insights
router.post('/person/:personId', generatePersonInsightsController);

// Project insights
router.post('/project/:projectId', generateProjectInsightsController);

// Meeting insights
router.post('/meeting/:meetingId', generateMeetingInsightsController);

export default router;
