import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import meetingRoutes from './routes/meeting.routes';
import audioRoutes from './routes/audio.routes';
import peopleRoutes from './routes/people.routes';
import projectRoutes from './routes/project.routes';
import searchRoutes from './routes/search.routes';
import noteRoutes from './routes/note.routes';
import insightRoutes from './routes/insight.routes';
import knowledgeRoutes from './routes/knowledge.routes';

// Initialize express app
const app = express();

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply error handler
app.use(errorHandler);

export default app;
