const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', [
  body('name').notEmpty().withMessage('নাম দিন'),
  body('email').isEmail().withMessage('সঠিক ইমেইল দিন'),
  body('phone').notEmpty().withMessage('মোবাইল দিন'),
  body('password').isLength({ min: 6 }).withMessage('পাসওয়ার্ড ৬ অক্ষরের হতে হবে')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, phone, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'এই ইমেইল দিয়ে অ্যাকাউন্ট আছে' });
    }

    const user = await User.create({ name, email, phone, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('সঠিক ইমেইল দিন'),
  body('password').notEmpty().withMessage('পাসওয়ার্ড দিন')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
