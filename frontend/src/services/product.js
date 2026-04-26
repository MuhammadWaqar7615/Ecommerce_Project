import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

// For public access (no authentication needed) - Use this for product listing
export const getPublicProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/public/search${params ? `?${params}` : ''}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// For authenticated customer access (cart, etc.)
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/customer/products${params ? `?${params}` : ''}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Get single product - use public endpoint
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/public/search?productId=${id}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const searchProducts = async (queryParams) => {
  try {
    const response = await api.get(`/public/search?${queryParams}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/public/categories');
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};