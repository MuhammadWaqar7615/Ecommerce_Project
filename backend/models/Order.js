const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    quantity: Number,
    price: Number,
  }],
  totalAmount: Number,
  shippingFee: Number,
  adminCommission: Number,
  vendorEarnings: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending',
  },
  stripePaymentIntentId: String,
  shippingAddress: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
  },
  estimatedDistance: Number,
  cancellationReason: String,
  cancelledAt: Date,
  deliveredAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);