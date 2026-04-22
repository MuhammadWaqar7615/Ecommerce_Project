import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const getCart = async () => {
  try {
    const response = await api.get('/customer/cart');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/customer/cart/add', { productId, quantity });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await api.put('/customer/cart/update', { productId, quantity });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const removeFromCart = async (productId) => {
  try {
    const response = await api.delete(`/customer/cart/remove/${productId}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};