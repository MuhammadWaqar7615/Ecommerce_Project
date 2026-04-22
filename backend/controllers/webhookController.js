const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  const order = await Order.findById(orderId).populate('customerId');

  if (order) {
    order.paymentStatus = 'Paid';
    order.status = 'Processing';
    await order.save();

    // Send confirmation email
    await sendOrderConfirmation(order.customerId.email, order.orderNumber);
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  const order = await Order.findById(orderId);

  if (order) {
    order.paymentStatus = 'Failed';
    order.status = 'Cancelled';
    await order.save();
  }
};

module.exports = { handleStripeWebhook };