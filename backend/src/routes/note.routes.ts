import express from 'express';
import { 
  generateNotesController,
  generateCustomNotesController
} from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Note generation routes
router.post('/generate/:meetingId', generateNotesController);
router.post('/generate-custom/:meetingId', generateCustomNotesController);

export default router;
