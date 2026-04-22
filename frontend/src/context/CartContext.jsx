import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setItemCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data.cart);
      const count = data.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity) => {
    try {
      const data = await addToCart(productId, quantity);
      setCart(data.cart);
      const count = data.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const data = await updateCartItem(productId, quantity);
      setCart(data.cart);
      const count = data.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      setCart(data.cart);
      const count = data.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(count);
      return true;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const value = {
    cart,
    loading,
    itemCount,
    loadCart,
    addItem,
    updateItem,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};