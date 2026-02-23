const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('নাম দিন'),
  body('phone').notEmpty().withMessage('মোবাইল নম্বর দিন'),
  body('message').notEmpty().withMessage('বার্তা লিখুন')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const contact = await Contact.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'বার্তা সফলভাবে পাঠানো হয়েছে',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/contact
// @desc    Get all contacts (Admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    // Check auth (simple version)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
});

module.exports = router;
