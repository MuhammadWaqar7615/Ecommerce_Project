import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  getStoredUser,
  isAuthenticated,
  logout as logoutService,
  handleGoogleCallback,
  setAuthData,
} from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Initialize auth state from localStorage
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsEmailVerified(storedUser.isEmailVerified || false);
      }
    }

    setLoading(false);
  }, []);

  const logout = () => {
    logoutService();
    setUser(null);
    setIsEmailVerified(false);
    setAuthError(null);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    setIsEmailVerified(newUser.isEmailVerified || false);
    setAuthData(localStorage.getItem('token'), newUser);
  };

  const login = (userData, token) => {
    setUser(userData);
    setIsEmailVerified(userData.isEmailVerified || false);
    setAuthData(token, userData);
    setAuthError(null);
  };

  const setError = (error) => {
    setAuthError(error);
  };

  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    setUser: updateUser,
    logout,
    login,
    isAuthenticated: isAuthenticated(),
    isEmailVerified,
    setIsEmailVerified,
    loading,
    authError,
    setError,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};