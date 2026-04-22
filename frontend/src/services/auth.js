import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const data = handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const login = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', { identifier, password });
    const data = handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};