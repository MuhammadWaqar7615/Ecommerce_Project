import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

// Vendor Management
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

export const suspendVendor = async (vendorId) => {
  try {
    const response = await api.put(`/admin/vendors/${vendorId}/suspend`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// User Management
export const getAllUsers = async (page = 1, limit = 20, role = '') => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const suspendUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Product Management
export const getAllProducts = async (page = 1, limit = 20, isVisible = null) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (isVisible !== null) params.append('isVisible', isVisible);
    const response = await api.get(`/admin/products?${params}`);
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

// Order Management
export const getAllOrders = async (page = 1, limit = 20, status = '') => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    const response = await api.get(`/admin/orders?${params}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Statistics
export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Settings
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