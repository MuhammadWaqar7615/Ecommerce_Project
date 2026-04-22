import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const getShop = async () => {
  try {
    const response = await api.get('/vendor/shop');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const createShop = async (shopData) => {
  try {
    const response = await api.post('/vendor/shop', shopData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateShop = async (shopData) => {
  try {
    const response = await api.put('/vendor/shop', shopData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getVendorProducts = async () => {
  try {
    const response = await api.get('/vendor/products');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post('/vendor/products', productData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/vendor/products/${id}`, productData);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/vendor/products/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getVendorOrders = async () => {
  try {
    const response = await api.get('/vendor/orders');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/vendor/orders/${orderId}/status`, { status });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getRevenueAnalytics = async (period = 'month') => {
  try {
    const response = await api.get(`/vendor/revenue?period=${period}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};