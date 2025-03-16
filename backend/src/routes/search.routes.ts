import express from 'express';
import { globalSearch } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Global search endpoint (protected)
router.get('/', authenticate, (req: any, res) => globalSearch(req, res));

export default router;
