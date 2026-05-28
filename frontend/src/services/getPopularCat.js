// src/services/category.js (create if missing)
import api from './api'; // your axios instance

export const getPopularCategories = async (limit = 4) => {
  try {
    const response = await api.get('/categories', {
      params: { popular: true, limit }
    });
    return response.data.categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};