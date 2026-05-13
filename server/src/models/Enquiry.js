const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  serviceType: String,
  eventDate: Date,
  time: String,
  venue: String,
  message: String,
  status: { 
    type: String, 
    enum: ['new', 'confirmed', 'rejected', 'read', 'replied', 'cancelled', 'completed'], 
    default: 'new' 
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
