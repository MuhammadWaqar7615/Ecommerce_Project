import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { FaTrash } from 'react-icons/fa';

const Cart = () => {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateItem(productId, newQuantity);
  };

  const removeItemFromCart = async (productId) => {
    if (window.confirm('Remove item from cart?')) {
      await removeItem(productId);
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 200; // Will be calculated in checkout
  const total = subtotal + shippingFee;

  if (loading) {
    return <div className="text-center py-10">Loading cart...</div>;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8">Browse our products and add some items to your cart!</p>
        <Link to="/products" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.productId.images?.[0] ? (
                      <img src={item.productId.images[0]} alt={item.productId.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">No img</div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <Link to={`/products/${item.productId._id}`} className="font-semibold hover:text-primary">
                      {item.productId.name}
                    </Link>
                    <p className="text-gray-500 text-sm">{item.productId.category}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItemFromCart(item.productId._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.priceAtAdd)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <Link to="/products" className="text-primary hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;