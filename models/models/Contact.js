const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  course: { 
    type: String, 
    enum: ['n5', 'n4', 'general', 'other'], 
    default: 'general' 
  },
  subject: { 
    type: String, 
    trim: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['new', 'in-progress', 'resolved'], 
    default: 'new' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Contact', contactSchema);
