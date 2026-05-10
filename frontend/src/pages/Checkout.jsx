import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/order';
import { formatPrice } from '../utils/formatPrice';

const Checkout = () => {
  const { cart, loadCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: 'Khanewal',
    district: '',
    postalCode: '',
  });
  const [shippingDistance, setShippingDistance] = useState(5);

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const safeDistance = Number.isNaN(Number(shippingDistance)) ? 0 : Number(shippingDistance);
  const shippingFee = 150 + safeDistance * 10;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const orderData = {
        shippingAddress,
        shippingDistance,
      };
      await createOrder(orderData);
      await loadCart(); // Refresh cart
      alert('Order placed successfully!');
      navigate('/customer/orders');
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!cartLoading && cart && cart.items && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  type="text"
                  className="input-field"
                  value={shippingAddress.district}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  className="input-field"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Distance from Khanewal (km) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  className="input-field"
                  value={shippingDistance}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setShippingDistance(Number.isNaN(value) ? 1 : Math.max(1, Math.min(50, value)));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Shipping fee: {formatPrice(150)} base + {formatPrice(10)}/km</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : `Place Order • ${formatPrice(total)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map((item) => {
                const product = item.productId || {};
                return (
                  <div key={product._id || item._id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {product.name || 'Product'}</span>
                    <span>{formatPrice(item.priceAtAdd * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({shippingDistance}km)</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;