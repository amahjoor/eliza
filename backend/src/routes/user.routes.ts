import express from 'express'
import { User } from '../models'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      
      const { email, password, firstName, lastName } = req.body
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }
      
      // Create new user
      const user = await User.create({
        email,
        password, // Will be hashed by model hook
        firstName,
        lastName
      })
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )
      
      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      })
      
    } catch (error) {
      console.error('Error registering user:', error)
      return res.status(500).json({ error: 'Failed to register user' })
    }
  }
)

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      
      const { email, password } = req.body
      
      // Find user by email
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      
      // Check password
      const isPasswordValid = await user.checkPassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )
      
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      })
      
    } catch (error) {
      console.error('Error logging in user:', error)
      return res.status(500).json({ error: 'Failed to login' })
    }
  }
)

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    return res.status(200).json(user)
    
  } catch (error) {
    console.error('Error getting user profile:', error)
    return res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Update user settings
router.put('/settings/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { settings } = req.body
    
    const user = await User.findByPk(id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update settings
    user.settings = {
      ...user.settings,
      ...settings
    }
    
    await user.save()
    
    return res.status(200).json({
      message: 'Settings updated successfully',
      settings: user.settings
    })
    
  } catch (error) {
    console.error('Error updating user settings:', error)
    return res.status(500).json({ error: 'Failed to update user settings' })
  }
})

export default router
