const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  coverImage: {
    cloudinaryId: String,
    url: String
  },
  images: [{
    cloudinaryId: String,
    url: String,
    order: Number
  }],
  videos: [{
    cloudinaryId: String,
    url: String,
    duration: String,
    order: Number
  }],
  cardSize: { type: String, enum: ['small', 'medium', 'large', 'portrait', 'landscape'], default: 'medium' },
  featured: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
