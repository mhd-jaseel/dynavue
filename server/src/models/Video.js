const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  cloudinaryId: { type: String, required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  title: String,
  category: { 
    type: String
  },
  duration: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
