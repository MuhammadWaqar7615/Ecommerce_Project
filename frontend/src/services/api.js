import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - DO NOT auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log and pass the error - let the component handle 401
    console.log('API Error:', error.response?.status, error.response?.data?.message);
    
    // IMPORTANT: Do NOT redirect here. Let the login component handle it.
    // Only remove token if it's not a login request
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        // Only clear token for non-login 401 errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;