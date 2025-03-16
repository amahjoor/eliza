import express from 'express';
import { 
  generatePersonInsightsController,
  generateProjectInsightsController,
  generateMeetingInsightsController
} from '../controllers/insight.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as express.RequestHandler);

// Insight generation routes
router.post('/person/:personId', generatePersonInsightsController as express.RequestHandler);
router.post('/project/:projectId', generateProjectInsightsController as express.RequestHandler);
router.post('/meeting/:meetingId', generateMeetingInsightsController as express.RequestHandler);

export default router;
