import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', authenticate, getProfile);

export default router;
