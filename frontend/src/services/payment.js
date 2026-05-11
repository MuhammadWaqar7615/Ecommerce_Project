import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

/**
 * Get Stripe public key from backend
 */
export const getStripePublicKey = async () => {
  try {
    const response = await api.get('/payment/public-key');
    return response.data.data.publicKey;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

/**
 * Create payment intent for an order
 * @param {string} orderId - The order ID
 * @returns {object} - { clientSecret, paymentIntentId }
 */
export const createPaymentIntent = async (orderId) => {
  try {
    console.log('Requesting payment intent for order:', orderId);
    const response = await api.post('/payment/create-intent', { orderId });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

/**
 * Process a refund for an order
 * @param {string} orderId - The order ID
 * @param {number} amount - Optional: amount to refund (if not provided, full refund)
 * @returns {object} - Refund details
 */
export const processRefund = async (orderId, amount = null) => {
  try {
    const payload = { orderId };
    if (amount) {
      payload.amount = amount;
    }
    const response = await api.post('/payment/refund', payload);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};
