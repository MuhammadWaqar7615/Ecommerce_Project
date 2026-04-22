import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/customer/orders', orderData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/customer/orders');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/customer/orders/${orderId}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`/customer/orders/${orderId}/cancel`, { reason });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await api.post('/customer/reviews', reviewData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};