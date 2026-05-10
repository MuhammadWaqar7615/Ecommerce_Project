import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

// ==================== REGISTRATION ====================
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const data = handleResponse(response);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// ==================== EMAIL VERIFICATION ====================
export const sendVerificationLink = async (email) => {
  try {
    const response = await api.post('/auth/send-verification', { email });
    const data = handleResponse(response);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
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

// ==================== LOGIN ====================
export const login = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', { email: identifier, password });
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

// ==================== GOOGLE OAUTH ====================
export const loginWithGoogle = () => {
  // Redirect to the backend OAuth endpoint using the configured API base URL.
  const apiBaseUrl = api.defaults.baseURL || 'http://localhost:5000/api';
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, '');
  window.location.href = `${normalizedBaseUrl}/auth/google`;
};

// Handle Google OAuth callback - call this after redirect
export const handleGoogleCallback = (token, user) => {
  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  }
  return null;
};

// ==================== PASSWORD RESET - MAGIC LINK ====================
export const sendPasswordResetLink = async (email) => {
  try {
    const response = await api.post('/auth/send-reset-link', { email });
    const data = handleResponse(response);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const resetPasswordWithLink = async (token, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    const data = handleResponse(response);
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// ==================== USER PROFILE ====================
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    const data = handleResponse(response);
    return data.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ==================== LOGOUT ====================
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// ==================== AUTH STATUS ====================
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};