import express from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as express.RequestHandler);

// Project routes (placeholder)
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Project routes' });
});

export default router;
