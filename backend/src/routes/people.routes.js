const express = require('express');
const { Person, Meeting, Project, MeetingAttendee, ProjectMember } = require('../models');
const router = express.Router();

// Get all people
router.get('/', async (req, res) => {
  try {
    const people = await Person.findAll({
      include: [
        { model: Meeting, as: 'meetings' },
        { model: Project, as: 'projects' }
      ]
    });
    res.status(200).json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

// Get person by ID
router.get('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id, {
      include: [
        { model: Meeting, as: 'meetings' },
        { model: Project, as: 'projects' }
      ]
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(200).json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
});

// Create a new person
router.post('/', async (req, res) => {
  try {
    const { name, email, role, organization, ...personData } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Create the person
    const person = await Person.create({
      name,
      email,
      role,
      organization,
      createdBy: req.user.id, // Assuming auth middleware sets req.user
      ...personData
    });
    
    res.status(201).json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// Update a person
router.put('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    await person.update(req.body);
    res.status(200).json(person);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// Delete a person
router.delete('/:id', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    await person.destroy();
    res.status(200).json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// Get meetings for a person
router.get('/:id/meetings', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    const meetings = await person.getMeetings({
      include: [
        { model: Person, as: 'attendees' }
      ]
    });
    
    res.status(200).json(meetings);
  } catch (error) {
    console.error('Error fetching person meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get projects for a person
router.get('/:id/projects', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    const projects = await person.getProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching person projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Generate AI insights for a person
router.post('/:id/generate-insights', async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id, {
      include: [
        { model: Meeting, as: 'meetings' }
      ]
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    // This would call an AI service to generate insights
    // For now, we'll just update with mock data
    await person.update({
      aiSummary: `${person.name} is a frequent contributor in meetings, particularly on technical topics. They have attended ${person.meetings.length} meetings in the last month.`,
      networkConnectivity: Math.min(person.meetings.length * 0.1, 1),
      contributions: {
        topics: ['Technical Architecture', 'Project Planning'],
        frequency: person.meetings.length,
        lastContribution: new Date()
      }
    });
    
    res.status(200).json({
      message: 'Insights generated successfully',
      person
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

module.exports = router;
