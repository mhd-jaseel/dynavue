const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  smtp: {
    server: String,
    port: Number,
    auth: {
      user: String,
      pass: String
    }
  },
  emailTemplates: {
    confirmation: String,
    inquiry: String
  },
  businessHours: {
    monday: { open: String, close: String, active: Boolean },
    tuesday: { open: String, close: String, active: Boolean },
    wednesday: { open: String, close: String, active: Boolean },
    thursday: { open: String, close: String, active: Boolean },
    friday: { open: String, close: String, active: Boolean },
    saturday: { open: String, close: String, active: Boolean },
    sunday: { open: String, close: String, active: Boolean }
  },
  appSettings: {
    logo: String,
    tagline: String,
    description: String
  },
  notificationPreferences: {
    emailOnBooking: { type: Boolean, default: true },
    emailOnEnquiry: { type: Boolean, default: true }
  },
  gallerySettings: {
    columns: { type: Number, default: 3 },
    spacing: { type: Number, default: 24 },
    masonry: { type: Boolean, default: true },
    defaultLayout: { type: String, enum: ['grid', 'masonry'], default: 'masonry' }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
