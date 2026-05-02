import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

// Shop Management
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

// Product Management
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

// Hide product (soft delete)
export const hideProduct = async (id) => {
  try {
    const response = await api.put(`/vendor/products/${id}/hide`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Show product (make visible)
export const showProduct = async (id) => {
  try {
    const response = await api.put(`/vendor/products/${id}/show`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/vendor/products/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Permanently delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/vendor/products/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Upload product image
export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/vendor/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Upload failed');
  }
};

export const getVendorCategories = async () => {
  try {
    const response = await api.get('/vendor/categories');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Order Management
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

// Revenue Analytics
export const getRevenueAnalytics = async (period = 'month') => {
  try {
    const response = await api.get(`/vendor/revenue?period=${period}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};