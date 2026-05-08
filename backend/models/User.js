const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    default: null,
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  providerId: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer',
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Phone is required only for local auth users
        if (this.provider === 'local' && !v) {
          return false;
        }
        // If phone is provided, validate format
        if (v && !/^[0-9]{10,15}$/.test(v)) {
          return false;
        }
        return true;
      },
      message: function() {
        if (this.provider === 'local' && !this.phone) {
          return 'Phone number is required for local authentication';
        }
        return 'Please enter a valid phone number (10-15 digits)';
      }
    },
    default: ''
  },
  address: {
    street: String,
    city: { type: String, default: 'Khanewal' },
    district: String,
    postalCode: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVendorApproved: {
    type: Boolean,
    default: false,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
  },
  magicLinkToken: String,
  magicLinkExpire: Date,
}, {
  timestamps: true,
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method (only for local auth)
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error('This user account does not have a password set');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);