const express = require('express');
const router = express.Router();
const { Project, Person, Meeting, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/projects
 * @desc Get all projects for the authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { createdBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get a project by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id },
      include: [
        { model: Person, as: 'members' },
        { model: Meeting, as: 'meetings' }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status, memberIds } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: true, message: 'Project name is required' });
    }
    
    // Create project
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status: status || 'active',
      createdBy: req.user.id
    });
    
    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      await project.addMembers(memberIds);
    }
    
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status, memberIds } = req.body;
    
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    // Update project
    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      startDate: startDate || project.startDate,
      endDate: endDate !== undefined ? endDate : project.endDate,
      status: status || project.status
    });
    
    // Update members if provided
    if (memberIds && memberIds.length > 0) {
      await project.setMembers(memberIds);
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    await project.destroy();
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/projects/:id/members
 * @desc Get all members for a project
 * @access Private
 */
router.get('/:id/members', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    const members = await project.getMembers();
    
    res.json(members);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/projects/:id/members
 * @desc Add members to a project
 * @access Private
 */
router.post('/:id/members', authenticateToken, async (req, res, next) => {
  try {
    const { memberIds } = req.body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: true, message: 'Member IDs are required' });
    }
    
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    await project.addMembers(memberIds);
    
    const updatedMembers = await project.getMembers();
    
    res.json(updatedMembers);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/projects/:id/members/:memberId
 * @desc Remove a member from a project
 * @access Private
 */
router.delete('/:id/members/:memberId', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    await project.removeMember(req.params.memberId);
    
    res.json({ message: 'Member removed from project successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/projects/:id/meetings
 * @desc Get all meetings for a project
 * @access Private
 */
router.get('/:id/meetings', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found' });
    }
    
    const meetings = await project.getMeetings({
      include: [
        { model: Person, as: 'attendees' }
      ]
    });
    
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
