const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  phone:       { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  pickup:      { type: String, required: true },
  dropoff:     { type: String, required: true },
  date:        { type: Date,   required: true },
  time:        { type: String, required: true },
  serviceType: { type: String, enum: ['economy', 'business', 'airport'], default: 'economy' },
  status:      { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
