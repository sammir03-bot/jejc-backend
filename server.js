const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jejcuser:Sammir553047@cluster0.q3ircrn.mongodb.net/jejc?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ========== SCHEMAS ==========

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: String,
  fee: Number,
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jejc_secret_key_2024_sammir');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ========== AUTH ROUTES ==========

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful!',
      user: { name, email, phone }
    });
    
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jejc_secret_key_2024_sammir',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== COURSE ROUTES ==========

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create course (Admin only)
app.post('/api/courses', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TEST ROUTE ==========
app.get('/', (req, res) => {
  res.json({ 
    message: 'JEJC Backend API is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
