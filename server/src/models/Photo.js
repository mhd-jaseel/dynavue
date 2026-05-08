const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  cloudinaryId: { type: String, required: true },
  url: { type: String, required: true },
  title: String,
  description: String,
  category: { 
    type: String
  },
  width: Number,
  height: Number,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
