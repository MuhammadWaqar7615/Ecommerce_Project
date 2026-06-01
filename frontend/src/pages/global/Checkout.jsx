import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import { createOrder } from '../../services/order';
import { getStripePublicKey } from '../../services/payment';
import StripePaymentForm from '../../components/common/StripePaymentForm';
import { formatPrice } from '../../utils/formatPrice';
import { getShop, getShopLocationById } from '../../services/vendor';
import { getLocationSuggestions } from '../../utils/locationApi';

const Checkout = () => {
  const { cart, loadCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    state: 'Khanewal',
    latitude: null,
    longitude: null,
  });

  const [shopsLocation, setShopsLocation] = useState([]);
  console.log(cart)
  const shopId= cart?.items?.map(item=>item.productId?.shopId) || []
  console.log(shopId)
  const getShopLocation = async (id) => {
    if (!id ) return null;
    const shop= await getShopLocationById(id);
    console.log(shop)
    return shop || null;
  }
  useEffect(()=>{
    const fetchLocations= async()=>{
      if(shopId && shopId.length>0){
        const locations = await Promise.all(shopId.map(id => getShopLocation(id)));
        console.log(locations)
        setShopsLocation(locations.filter(loc => loc !== null));
      }
    }
    fetchLocations();
  }
  ,[shopId.length])

  console.log(shopsLocation)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  const [shippingDistance, setShippingDistance] = useState(5);
  const [step, setStep] = useState('shipping'); // 'shipping' or 'payment'
  const [orderId, setOrderId] = useState(null);
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(false);

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const safeDistance = Number.isNaN(Number(shippingDistance)) ? 0 : Number(shippingDistance);
  const shippingFee = 150 + safeDistance * 10;
  const total = subtotal + shippingFee;



  // Load Stripe public key when needed
  useEffect(() => {
    if (step === 'payment' && !stripePublicKey && !loadingKey) {
      setLoadingKey(true);
      getStripePublicKey()
        .then(setStripePublicKey)
        .catch((error) => {
          console.error('Failed to load Stripe key:', error);
          alert('Failed to load payment form. Please try again.');
          setStep('shipping');
        })
        .finally(() => setLoadingKey(false));
    }
  }, [step, stripePublicKey, loadingKey]);

  const handleSubmitShipping = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        shippingAddress,
        shippingDistance,
      };
      const order = await createOrder(orderData);
      console.log(order)
      setOrderId(order?.order?._id);
      setStep('payment');
    } catch (error) {
      alert(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (redirectUrl) => {
    // Navigate to success page with payment details
    console.log(redirectUrl)
    // navigate(redirectUrl,{replace:true});
    window.location.href=redirectUrl
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleBackToShipping = () => {
    setStep('shipping');
    setOrderId(null);
  };

  useEffect(() => {
    if (!cartLoading && cart && cart.items && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AnimatedLoader size="lg" label="Loading cart..." />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return null;
  }


  const handleAddressChange = async (e) => {
    const address = e.target.value;
    setShippingAddress((prev) => ({ ...prev, address }));
    if (e.target.value.length > 2) {
      const suggestions= await getLocationSuggestions(e.target.value, { limit: 5, country: 'pk' });
      setSuggestions(suggestions);
      setShowSuggestions(true);

  }}
  console.log(shippingAddress)


  const handleSuggestionClick = (suggestion) => {
    setShippingAddress((prev) => ({
      ...prev,
      address: suggestion.placeName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
    setShowSuggestions(false);
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {step === 'shipping' ? (
            // Shipping Form
            <form onSubmit={handleSubmitShipping} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Address *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="mt-2 border rounded-md">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={()=>handleSuggestionClick(suggestion)}
                        >
                          {suggestion?.placeName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <input
                    type="text"
                    className="input-field"
                    value={shippingAddress.district}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, district: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    className="input-field"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
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
                {submitting ? 'Creating order...' : 'Continue to Payment'}
              </button>
            </form>
          ) : (
            // Payment Form
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Payment</h2>
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              </div>

              <StripePaymentForm
                publicKey={stripePublicKey}
                orderId={orderId}
                total={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isLoading={loadingKey}
              />

              <button
                type="button"
                onClick={handleBackToShipping}
                disabled={submitting || loadingKey}
                className="w-full mt-4 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                Back to Shipping
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
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

            {step === 'payment' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                💳 Payment is secured by Stripe
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;