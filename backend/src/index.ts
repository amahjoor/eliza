import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './models'
import audioRoutes from './routes/audio.routes'
import meetingRoutes from './routes/meeting.routes'
import userRoutes from './routes/user.routes'
import peopleRoutes from './routes/people.routes'
import projectRoutes from './routes/project.routes'
import authRoutes from './routes/auth.routes'
import searchRoutes from './routes/search.routes'
import { errorHandler, notFound } from './middleware/error.middleware'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/audio', audioRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/people', peopleRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/search', searchRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Eliza.ai API is running' })
})

// Start server
const startServer = async () => {
  try {
    // Sync database models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    console.log('Database synchronized')

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
