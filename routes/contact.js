const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

router.post('/', [
  body('name').notEmpty().withMessage('নাম দিন'),
  body('phone').notEmpty().withMessage('মোবাইল দিন'),
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
      message: 'বার্তা পাঠানো হয়েছে',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
