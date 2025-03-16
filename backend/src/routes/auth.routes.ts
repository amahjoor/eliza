import express from 'express';
import { login, register, refreshToken, logout } from '../controllers/auth.controller';

const router = express.Router();

// Auth routes
router.post('/login', login as express.RequestHandler);
router.post('/register', register as express.RequestHandler);
router.post('/refresh', refreshToken as express.RequestHandler);
router.post('/logout', logout as express.RequestHandler);

export default router;
