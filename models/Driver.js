const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone:    { type: String, trim: true },
  vehicle:  { type: String, trim: true },
  status:   { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
}, { timestamps: true });

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

driverSchema.methods.matchPassword = function (raw) {
  return bcrypt.compare(raw, this.password);
};

module.exports = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
