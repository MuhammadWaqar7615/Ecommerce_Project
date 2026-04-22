import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const getPendingVendors = async () => {
  try {
    const response = await api.get('/admin/vendors/pending');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const approveVendor = async (vendorId) => {
  try {
    const response = await api.put(`/admin/vendors/${vendorId}/approve`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getAllProducts = async () => {
  try {
    const response = await api.get('/admin/products');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const toggleProductVisibility = async (productId) => {
  try {
    const response = await api.put(`/admin/products/${productId}/toggle`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get('/admin/orders');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateSetting = async (key, value) => {
  try {
    const response = await api.put('/admin/settings', { key, value });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};