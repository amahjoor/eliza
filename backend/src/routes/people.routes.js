const express = require('express');
const router = express.Router();
const { Person, User, Meeting } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/people
 * @desc Get all people for the authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const people = await Person.findAll({
      where: { createdBy: req.user.id },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    res.json(people);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/people/:id
 * @desc Get a person by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const person = await Person.findOne({
      where: { id: req.params.id, createdBy: req.user.id },
      include: [
        { model: Meeting, as: 'meetings' }
      ]
    });
    
    if (!person) {
      return res.status(404).json({ error: true, message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/people
 * @desc Create a new person
 * @access Private
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, profilePicture, userId, tags, userNotes } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: true, message: 'First name and last name are required' });
    }
    
    // Create person
    const person = await Person.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      profilePicture,
      userId,
      tags,
      userNotes,
      createdBy: req.user.id
    });
    
    res.status(201).json(person);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/people/:id
 * @desc Update a person
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, profilePicture, userId, tags, userNotes } = req.body;
    
    const person = await Person.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!person) {
      return res.status(404).json({ error: true, message: 'Person not found' });
    }
    
    // Update person
    await person.update({
      firstName: firstName || person.firstName,
      lastName: lastName || person.lastName,
      email: email !== undefined ? email : person.email,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : person.phoneNumber,
      profilePicture: profilePicture !== undefined ? profilePicture : person.profilePicture,
      userId: userId !== undefined ? userId : person.userId,
      tags: tags || person.tags,
      userNotes: userNotes !== undefined ? userNotes : person.userNotes
    });
    
    res.json(person);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/people/:id
 * @desc Delete a person
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const person = await Person.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!person) {
      return res.status(404).json({ error: true, message: 'Person not found' });
    }
    
    await person.destroy();
    
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/people/:id/meetings
 * @desc Get all meetings for a person
 * @access Private
 */
router.get('/:id/meetings', authenticateToken, async (req, res, next) => {
  try {
    const person = await Person.findOne({
      where: { id: req.params.id, createdBy: req.user.id }
    });
    
    if (!person) {
      return res.status(404).json({ error: true, message: 'Person not found' });
    }
    
    const meetings = await person.getMeetings({
      include: [
        { model: Person, as: 'attendees' }
      ]
    });
    
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/people/search/:query
 * @desc Search for people
 * @access Private
 */
router.get('/search/:query', authenticateToken, async (req, res, next) => {
  try {
    const { query } = req.params;
    
    const people = await Person.findAll({
      where: {
        createdBy: req.user.id,
        [sequelize.Op.or]: [
          { firstName: { [sequelize.Op.iLike]: `%${query}%` } },
          { lastName: { [sequelize.Op.iLike]: `%${query}%` } },
          { email: { [sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    res.json(people);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
