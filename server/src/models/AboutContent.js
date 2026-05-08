const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: "The Story Behind DYNAVUE" },
    image: { type: String }
  },
  bio: {
    title: { type: String, default: "Hello, I'm the eye behind DYNAVUE." },
    paragraphs: [{ type: String }],
    image: { type: String }
  },
  philosophy: {
    quote: { type: String, default: "We believe that a photograph shouldn't just be seen; it should be felt." }
  },
  stats: [{
    num: String,
    label: String
  }],
  gear: {
    cameras: [{ type: String }],
    lenses: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('AboutContent', aboutSchema);
