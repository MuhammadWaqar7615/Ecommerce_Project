const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  logo: String,
  banner: String,
  contactPhone: String,
  contactEmail: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Shop', shopSchema);