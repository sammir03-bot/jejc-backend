require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jejcuser:Sammir553047@cluster0.q3ircrn.mongodb.net/jejc?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ===== SCHEMAS =====
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  course: { type: String, required: true },
  education: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  subject: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
const Contact = mongoose.model('Contact', contactSchema);

// ===== ROUTES =====
// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'JEJC Backend is Running',
    timestamp: new Date().toISOString()
  });
});

// Student Routes
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ 
      success: true, 
      message: 'Admission successful!', 
      student 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact Routes
app.post('/api/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ 
      success: true, 
      message: 'Message sent!', 
      contact 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JEJC API',
    endpoints: ['/api/health', '/api/students', '/api/contacts']
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
