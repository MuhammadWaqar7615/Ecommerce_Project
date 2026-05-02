const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,  // ← ADD THIS - allows multiple null values
  },
}, {
  timestamps: true,
});

// Auto-generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);