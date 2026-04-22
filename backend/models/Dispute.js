const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: ['Wrong Item', 'Not Delivered', 'Damaged', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  customerEvidence: [String],
  vendorResponse: String,
  vendorEvidence: [String],
  status: {
    type: String,
    enum: ['Open', 'Vendor Responded', 'Admin Reviewing', 'Resolved', 'Rejected'],
    default: 'Open',
  },
  adminDecision: {
    type: String,
    enum: ['Refund', 'Replace', 'Reject'],
  },
  adminNotes: String,
  resolvedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Dispute', disputeSchema);