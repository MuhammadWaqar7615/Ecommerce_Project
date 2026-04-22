const stripe = require('../config/stripe');

const createPaymentIntent = async (amount, vendorStripeAccountId, adminCommission, orderId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paisa
      currency: 'pkr',
      application_fee_amount: Math.round(adminCommission * 100),
      transfer_data: {
        destination: vendorStripeAccountId,
      },
      metadata: {
        orderId: orderId.toString(),
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Stripe error:', error);
    throw new Error('Payment processing failed');
  }
};

const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = { payment_intent: paymentIntentId };
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }
    
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error('Refund processing failed');
  }
};

module.exports = { createPaymentIntent, refundPayment };