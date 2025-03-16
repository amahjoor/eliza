import express from 'express'
import { Person, Meeting } from '../models'

const router = express.Router()

// Get all people
router.get('/', async (req, res) => {
  try {
    const people = await Person.findAll()
    return res.status(200).json(people)
  } catch (error) {
    console.error('Error getting people:', error)
    return res.status(500).json({ error: 'Failed to get people' })
  }
})

// Get person by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const person = await Person.findByPk(id, {
      include: [
        {
          model: Meeting,
          as: 'meetings',
          through: { attributes: [] }
        }
      ]
    })
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    
    return res.status(200).json(person)
    
  } catch (error) {
    console.error('Error getting person:', error)
    return res.status(500).json({ error: 'Failed to get person' })
  }
})

// Create a new person
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, organization, role } = req.body
    
    const person = await Person.create({
      firstName,
      lastName,
      email,
      organization,
      role
    })
    
    return res.status(201).json(person)
    
  } catch (error) {
    console.error('Error creating person:', error)
    return res.status(500).json({ error: 'Failed to create person' })
  }
})

// Update a person
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, organization, role } = req.body
    
    const person = await Person.findByPk(id)
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    
    // Update person fields
    if (firstName) person.firstName = firstName
    if (lastName) person.lastName = lastName
    if (email !== undefined) person.email = email
    if (organization !== undefined) person.organization = organization
    if (role !== undefined) person.role = role
    
    await person.save()
    
    return res.status(200).json(person)
    
  } catch (error) {
    console.error('Error updating person:', error)
    return res.status(500).json({ error: 'Failed to update person' })
  }
})

// Delete a person
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const person = await Person.findByPk(id)
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    
    await person.destroy()
    
    return res.status(200).json({ message: 'Person deleted successfully' })
    
  } catch (error) {
    console.error('Error deleting person:', error)
    return res.status(500).json({ error: 'Failed to delete person' })
  }
})

// Update person's AI summary
router.post('/:id/generate-summary', async (req, res) => {
  try {
    const { id } = req.params
    
    const person = await Person.findByPk(id, {
      include: [
        {
          model: Meeting,
          as: 'meetings',
          through: { attributes: [] }
        }
      ]
    })
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    
    // In a real implementation, we would:
    // 1. Process the person's meeting history with OpenAI
    // 2. Generate a summary of their contributions and insights
    
    // For this implementation, we'll simulate the process
    const aiSummary = `${person.firstName} ${person.lastName} has participated in ${person.meetings.length} meetings. They frequently contribute insights on product development and marketing strategies.`
    
    // Update person with AI summary
    person.aiSummary = aiSummary
    await person.save()
    
    return res.status(200).json({
      message: 'AI summary generated successfully',
      aiSummary
    })
    
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return res.status(500).json({ error: 'Failed to generate AI summary' })
  }
})

export default router
