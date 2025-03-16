import express from 'express'
import { Project, Person, Meeting } from '../models'

const router = express.Router()

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    const projects = await Project.findAll({
      where,
      include: [
        {
          model: Person,
          as: 'members',
          through: { attributes: [] }
        }
      ]
    })
    
    return res.status(200).json(projects)
    
  } catch (error) {
    console.error('Error getting projects:', error)
    return res.status(500).json({ error: 'Failed to get projects' })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const project = await Project.findByPk(id, {
      include: [
        {
          model: Person,
          as: 'members',
          through: { attributes: [] }
        },
        {
          model: Meeting
        }
      ]
    })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    return res.status(200).json(project)
    
  } catch (error) {
    console.error('Error getting project:', error)
    return res.status(500).json({ error: 'Failed to get project' })
  }
})

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, userId, memberIds } = req.body
    
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status,
      userId
    })
    
    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      const members = await Person.findAll({
        where: { id: memberIds }
      })
      
      await project.$add('members', members)
    }
    
    return res.status(201).json(project)
    
  } catch (error) {
    console.error('Error creating project:', error)
    return res.status(500).json({ error: 'Failed to create project' })
  }
})

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, startDate, endDate, status, memberIds } = req.body
    
    const project = await Project.findByPk(id)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Update project fields
    if (name) project.name = name
    if (description !== undefined) project.description = description
    if (startDate !== undefined) project.startDate = startDate
    if (endDate !== undefined) project.endDate = endDate
    if (status) project.status = status
    
    await project.save()
    
    // Update members if provided
    if (memberIds && memberIds.length > 0) {
      const members = await Person.findAll({
        where: { id: memberIds }
      })
      
      await project.$set('members', members)
    }
    
    return res.status(200).json(project)
    
  } catch (error) {
    console.error('Error updating project:', error)
    return res.status(500).json({ error: 'Failed to update project' })
  }
})

// Update project knowledge base
router.put('/:id/knowledge-base', async (req, res) => {
  try {
    const { id } = req.params
    const { knowledgeBase } = req.body
    
    const project = await Project.findByPk(id)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Update knowledge base
    project.knowledgeBase = knowledgeBase
    await project.save()
    
    return res.status(200).json({
      message: 'Knowledge base updated successfully',
      knowledgeBase: project.knowledgeBase
    })
    
  } catch (error) {
    console.error('Error updating knowledge base:', error)
    return res.status(500).json({ error: 'Failed to update knowledge base' })
  }
})

// Update project timeline
router.put('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params
    const { timeline } = req.body
    
    const project = await Project.findByPk(id)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Update timeline
    project.timeline = timeline
    await project.save()
    
    return res.status(200).json({
      message: 'Timeline updated successfully',
      timeline: project.timeline
    })
    
  } catch (error) {
    console.error('Error updating timeline:', error)
    return res.status(500).json({ error: 'Failed to update timeline' })
  }
})

// Update project goals
router.put('/:id/goals', async (req, res) => {
  try {
    const { id } = req.params
    const { goals } = req.body
    
    const project = await Project.findByPk(id)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Update goals
    project.goals = goals
    await project.save()
    
    return res.status(200).json({
      message: 'Goals updated successfully',
      goals: project.goals
    })
    
  } catch (error) {
    console.error('Error updating goals:', error)
    return res.status(500).json({ error: 'Failed to update goals' })
  }
})

// Update project tasks
router.put('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params
    const { tasks } = req.body
    
    const project = await Project.findByPk(id)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Update tasks
    project.tasks = tasks
    await project.save()
    
    return res.status(200).json({
      message: 'Tasks updated successfully',
      tasks: project.tasks
    })
    
  } catch (error) {
    console.error('Error updating tasks:', error)
    return res.status(500).json({ error: 'Failed to update tasks' })
  }
})

export default router
