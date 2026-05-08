const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  features: [{ type: String }],
  price: { type: String },
  image: {
    url: String,
    cloudinaryId: String
  },
  order: { type: Number, default: 0 },
  featuredOnHome: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },
  slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
