// src/pages/Cart.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import AlertConfirmation from '../../components/common/AlertConfirmation';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { Trash2, Minus, Plus, ShoppingBag, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();
  const [removeConfirmation, setRemoveConfirmation] = useState({ open: false, productId: null, productName: '' });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateItem(productId, newQuantity);
  };

  const handleRemoveClick = (productId, productName) => {
    setRemoveConfirmation({ open: true, productId, productName });
  };

  const confirmRemove = async () => {
    const { productId } = removeConfirmation;
    await removeItem(productId);
    toast.success('Item removed from cart');
    setRemoveConfirmation({ open: false, productId: null, productName: '' });
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 200;
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading cart..." />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Browse our products and add some items to your cart!</p>
          <Link to="/products">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary inline-block">
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen py-8 md:py-12 mt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Continue Shopping</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">Shopping Cart</h1>
                <p className="text-sm text-gray-500 mt-1">{cart.items.length} items</p>
              </div>

              <AnimatePresence mode="wait">
                <div className="divide-y divide-gray-100">
                  {cart.items.map((item) => {
                    const product = item.productId || {};
                    const productId = product._id || item.productId || item._id;
                    const productName = product.name || 'Product';
                    const productImage = product.images?.[0] || null;
                    const category = product.category?.name || product.category || 'Uncategorized';

                    return (
                      <motion.div
                        key={productId}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="p-5 flex flex-col sm:flex-row gap-5"
                      >
                        {/* Image */}
                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag size={28} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-grow space-y-2">
                          <Link to={`/products/${productId}`} className="font-semibold text-gray-800 hover:text-primary transition">
                            {productName}
                          </Link>
                          <p className="text-sm text-gray-500">{category}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(productId, item.quantity - 1)}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center text-sm font-medium text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(productId, item.quantity + 1)}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveClick(productId, productName)}
                              className="text-red-500 hover:text-red-700 transition p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right sm:text-left">
                          <p className="font-bold text-gray-800">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                          <p className="text-xs text-gray-400">{formatPrice(item.priceAtAdd)} each</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Alert */}
      <AlertConfirmation
        isOpen={removeConfirmation.open}
        title="Remove Item"
        message={`Are you sure you want to remove "${removeConfirmation.productName}" from your cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemove}
        onClose={() => setRemoveConfirmation({ open: false, productId: null, productName: '' })}
        type="danger"
      />
    </div>
  );
};

export default Cart;