const express = require('express');
const { Project, Person, Meeting, ProjectMember } = require('../models');
const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Person, as: 'members' },
        { model: Meeting, as: 'meetings' }
      ]
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Person, as: 'members' },
        { model: Meeting, as: 'meetings' }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, memberIds, ...projectData } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    // Create the project
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id, // Assuming auth middleware sets req.user
      ...projectData
    });
    
    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      await Promise.all(
        memberIds.map(({ personId, role }) => 
          ProjectMember.create({
            ProjectId: project.id,
            PersonId: personId,
            role: role || null
          })
        )
      );
    }
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { memberIds, ...updateData } = req.body;
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Update project data
    await project.update(updateData);
    
    // Update members if provided
    if (memberIds) {
      // Remove existing members
      await ProjectMember.destroy({
        where: { ProjectId: project.id }
      });
      
      // Add new members
      if (memberIds.length > 0) {
        await Promise.all(
          memberIds.map(({ personId, role }) => 
            ProjectMember.create({
              ProjectId: project.id,
              PersonId: personId,
              role: role || null
            })
          )
        );
      }
    }
    
    // Fetch updated project with associations
    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        { model: Person, as: 'members' }
      ]
    });
    
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await project.destroy();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
