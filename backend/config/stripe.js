const Stripe = require('stripe');

// Validate that required Stripe environment variables are set
const requiredStripeKeys = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLIC_KEY', 'STRIPE_WEBHOOK_SECRET'];
const missingKeys = requiredStripeKeys.filter(key => !process.env[key]);

if (missingKeys.length > 0) {
  console.warn(`⚠️  Missing Stripe environment variables: ${missingKeys.join(', ')}`);
  console.warn('Please add these to your .env file. Get them from: https://dashboard.stripe.com/account/apikeys');
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
});

/**
 * Get Stripe Public Key for frontend use
 * @returns {string} Stripe publishable/public key
 */
const getPublicKey = () => {
  if (!process.env.STRIPE_PUBLIC_KEY) {
    throw new Error('STRIPE_PUBLIC_KEY is not configured in environment variables');
  }
  return process.env.STRIPE_PUBLIC_KEY;
};

/**
 * Get Stripe Webhook Secret for signature verification
 * @returns {string} Stripe webhook secret
 */
const getWebhookSecret = () => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured in environment variables');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
};

module.exports = stripe;
module.exports.getPublicKey = getPublicKey;
module.exports.getWebhookSecret = getWebhookSecret;