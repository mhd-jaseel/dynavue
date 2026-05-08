const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { type: String, enum: ['edit', 'cancel'], required: true },
  updatedData: { type: Object },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
