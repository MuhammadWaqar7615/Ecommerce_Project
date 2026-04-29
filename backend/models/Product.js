const mongoose = require('mongoose');
const Category = require('./Category');  // ← ADD THIS LINE

const productSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',  // Now Category is defined
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  images: [{
    type: String,
  }],
  isVisible: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);