const mongoose = require('mongoose');

const homeHighlightSchema = new mongoose.Schema({
  smallHeading: { type: String, default: 'Featured Highlights' },
  mainTitlePart1: { type: String, default: 'The Art of' },
  mainTitleItalic: { type: String, default: 'Storytelling' },
  buttonText: { type: String, default: 'Explore Portfolio' },
  buttonLink: { type: String, default: '/portfolio' },
  ctaBgImage: { type: String, default: '' },
  photos: [{
    url: String,
    alt: String,
    category: String,
    cloudinaryId: String,
    order: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HomeHighlight', homeHighlightSchema);
