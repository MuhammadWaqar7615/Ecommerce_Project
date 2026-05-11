const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get webhook secret and construct event
    const webhookSecret = stripe.getWebhookSecret();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
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
  console.log('Payment succeeded for intent:', paymentIntent.id);
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
  console.log('Payment failed for intent:', paymentIntent.id);
  const orderId = paymentIntent.metadata.orderId;
  const order = await Order.findById(orderId);

  if (order) {
    order.paymentStatus = 'Failed';
    order.status = 'Cancelled';
    await order.save();
  }
};

module.exports = { handleStripeWebhook };