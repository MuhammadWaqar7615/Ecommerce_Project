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
  const { user, isAuthenticated } = useAuth();

  const loadCart = async () => {
    // Only load cart for customers
    if (!isAuthenticated || user?.role !== 'customer') {
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
      // Don't show error for non-customer roles
      if (error.message?.includes('403')) {
        // Silently fail for non-customers
        setCart(null);
        setItemCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity) => {
    if (user?.role !== 'customer') {
      throw new Error('Only customers can add items to cart');
    }
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
    if (user?.role !== 'customer') {
      throw new Error('Only customers can update cart');
    }
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
    if (user?.role !== 'customer') {
      throw new Error('Only customers can remove items from cart');
    }
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
  }, [isAuthenticated, user?.role]);

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