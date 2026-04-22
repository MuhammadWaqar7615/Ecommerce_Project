const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { refundPayment } = require('../services/stripeService');

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.paymentStatus !== 'Pending') {
      return errorResponse(res, 'Payment already processed', 400);
    }

    // Get vendor's Stripe account ID
    const vendor = await User.findById(order.items[0].shopId.vendorId);
    if (!vendor || !vendor.stripeAccountId) {
      return errorResponse(res, 'Vendor payment setup incomplete', 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'pkr',
      application_fee_amount: Math.round(order.adminCommission * 100),
      transfer_data: {
        destination: vendor.stripeAccountId,
      },
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    successResponse(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (!order.stripePaymentIntentId) {
      return errorResponse(res, 'No payment found for this order', 400);
    }

    const refund = await refundPayment(order.stripePaymentIntentId, amount);

    order.paymentStatus = amount === order.totalAmount ? 'Refunded' : 'Partial Refund';
    if (amount === order.totalAmount) {
      order.status = 'Refunded';
    }
    await order.save();

    successResponse(res, { refund }, 'Refund processed successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createPaymentIntent,
  processRefund,
};