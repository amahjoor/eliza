import express from 'express';
import { 
  generateNotesController,
  generateCustomNotesController
} from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as express.RequestHandler);

// Note generation routes
router.post('/generate/:meetingId', generateNotesController as express.RequestHandler);
router.post('/generate-custom/:meetingId', generateCustomNotesController as express.RequestHandler);

export default router;
