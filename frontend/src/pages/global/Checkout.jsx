// src/pages/Checkout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import { createOrder } from '../../services/order';
import { getStripePublicKey } from '../../services/payment';
import StripePaymentForm from '../../components/common/StripePaymentForm';
import { formatPrice } from '../../utils/formatPrice';
import { getShopLocationById } from '../../services/vendor';
import { getLocationSuggestions, calculateDistance } from '../../utils/locationApi';
import { getSettings } from '../../services/admin';
import useDebounce from '../../hooks/useDebounce';
import { Truck, MapPin, CreditCard, ShoppingBag, ChevronLeft, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const { cart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    city: '',
    address: '',
    latitude: null,
    longitude: null,
    cityLat: null,
    cityLng: null,
  });

  const [shopsLocation, setShopsLocation] = useState([]);
  const [adminSettings, setAdminSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [shippingDistance, setShippingDistance] = useState(0);
  const [dataReady, setDataReady] = useState(false);
  const lastCalculatedRef = useRef('');

  const getShopIdFromItem = (item) => {
    if (item.productId?.shopId) return item.productId.shopId;
    if (item.shopId) return item.shopId;
    if (item.vendorId) return item.vendorId;
    if (item.productId && typeof item.productId === 'string') {
      console.warn('productId is a string, cannot extract shopId', item.productId);
      return null;
    }
    console.warn('No shopId found in cart item', item);
    return null;
  };

  useEffect(() => {
    const fetchLocations = async () => {
      if (cartLoading || !cart?.items || cart.items.length === 0) return;
      const ids = cart.items.map(item => getShopIdFromItem(item)).filter(Boolean);
      if (ids.length === 0) {
        console.error('No valid shop IDs found in cart. Cannot calculate delivery distance.');
        setShopsLocation([]);
        return;
      }
      const uniqueShopIds = [...new Set(ids)];
      const locations = await Promise.all(uniqueShopIds.map(id => getShopLocationById(id)));
      setShopsLocation(locations.filter(loc => loc !== null));
    };
    fetchLocations();
  }, [cartLoading, cart?.items]);

  const [citySearchTerm, setCitySearchTerm] = useState('');
  const debouncedCitySearchTerm = useDebounce(citySearchTerm, 500);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [step, setStep] = useState('shipping');
  const [orderId, setOrderId] = useState(null);
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(false);

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingBaseFee = adminSettings?.shipping_base_fee || 0;
  const shippingPerKmRate = adminSettings?.shipping_per_km_rate || 0;
  const maxDistanceForDelivery = adminSettings?.max_distance_for_delivery || 0;
  const shippingFee = shippingBaseFee + Math.ceil(shippingDistance) * shippingPerKmRate;
  const total = subtotal + shippingFee;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const settings = await getSettings();
        setAdminSettings(settings.settings);
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        alert('Failed to load delivery settings. Please try again.');
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const ready = shopsLocation.length > 0 && adminSettings !== null;
    setDataReady(ready);
  }, [shopsLocation, adminSettings]);

  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (debouncedCitySearchTerm.length > 2) {
        const suggestions = await getLocationSuggestions(debouncedCitySearchTerm, {
          limit: 5,
          country: 'pk',
          types: 'place'
        });
        setCitySuggestions(suggestions);
        setShowCitySuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    };
    fetchCitySuggestions();
  }, [debouncedCitySearchTerm]);

  useEffect(() => {
    const calculateDistanceNow = async () => {
      const targetLat = shippingAddress.latitude ?? shippingAddress.cityLat;
      const targetLng = shippingAddress.longitude ?? shippingAddress.cityLng;
      if (!targetLat || !targetLng) {
        setShippingDistance(0);
        return;
      }
      if (!dataReady) return;
      const firstShop = shopsLocation[0];
      if (!firstShop?.location) {
        setShippingDistance(0);
        return;
      }
      const calcKey = `${targetLat},${targetLng}|${firstShop.location.latitude},${firstShop.location.longitude}`;
      if (lastCalculatedRef.current === calcKey) return;
      try {
        const shopLoc = [firstShop.location.longitude, firstShop.location.latitude];
        const distData = await calculateDistance([targetLng, targetLat], shopLoc);
        const limitedDistance = Math.min(distData.distance, maxDistanceForDelivery);
        setShippingDistance(limitedDistance);
        lastCalculatedRef.current = calcKey;
      } catch (error) {
        console.error('Error calculating distance:', error);
        setShippingDistance(0);
      }
    };
    calculateDistanceNow();
  }, [
    shippingAddress.cityLat,
    shippingAddress.cityLng,
    shippingAddress.latitude,
    shippingAddress.longitude,
    dataReady,
    shopsLocation,
    adminSettings,
    maxDistanceForDelivery
  ]);

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
    const finalLat = shippingAddress.latitude ?? shippingAddress.cityLat;
    const finalLng = shippingAddress.longitude ?? shippingAddress.cityLng;
    if (!finalLat || !finalLng) {
      alert('Please select a valid city from the suggestions');
      return;
    }
    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          latitude: finalLat,
          longitude: finalLng
        },
        shippingDistance,
      };
      const order = await createOrder(orderData);
      setOrderId(order?.order?._id);
      setStep('payment');
    } catch (error) {
      alert(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (redirectUrl) => {
    window.location.href = redirectUrl;
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

  const handleCityChange = (e) => {
    const city = e.target.value;
    setCitySearchTerm(city);
    setShippingAddress((prev) => ({
      ...prev,
      city,
      address: '',
      latitude: null,
      longitude: null,
      cityLat: null,
      cityLng: null
    }));
  };

  const handleCitySuggestionClick = (suggestion) => {
    setShippingAddress((prev) => ({
      ...prev,
      city: suggestion.text,
      cityLat: suggestion.latitude,
      cityLng: suggestion.longitude,
      address: suggestion.placeName,
    }));
    setCitySearchTerm(suggestion.placeName);
    setShowCitySuggestions(false);
  };

  const handleAddressInputChange = (e) => {
    const address = e.target.value;
    setShippingAddress((prev) => ({ ...prev, address }));
  };

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

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  if (cartLoading || loadingSettings) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading checkout..." />
      </div>
    );
  }

  if (!cartLoading && shopsLocation.length === 0 && cart?.items?.length > 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-800 mb-2">Unable to calculate delivery</h2>
          <p className="text-gray-500 mb-6">Shop information is missing. Please contact support.</p>
          <button onClick={() => navigate('/cart')} className="btn-primary w-full">
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50/30 min-h-screen py-8 md:py-12 mt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Back to Cart</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your purchase securely</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Shipping / Payment */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              {step === 'shipping' ? (
                <motion.div
                  key="shipping"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitShipping} className="p-6 space-y-5">
                      {/* City with suggestions */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Search for your city..."
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={citySearchTerm}
                          onChange={handleCityChange}
                        />
                        {showCitySuggestions && citySuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {citySuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition"
                                onClick={() => handleCitySuggestionClick(suggestion)}
                              >
                                {suggestion.placeName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Full Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Address / Street <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!shippingAddress.cityLat}
                          placeholder={shippingAddress.city ? "Enter street, building, area..." : "Please select city first"}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          value={shippingAddress.address}
                          onChange={handleAddressInputChange}
                        />
                      </div>

                      {/* Distance & Fee */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Distance (km)
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                            value={shippingDistance ? shippingDistance.toFixed(2) : '0'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Shipping Fee
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                            value={formatPrice(shippingFee)}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Shipping fee: {formatPrice(shippingBaseFee)} base + {formatPrice(shippingPerKmRate)}/km (max {maxDistanceForDelivery}km)
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting || !shippingAddress.cityLat}
                        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 mt-4"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating order...
                          </div>
                        ) : (
                          'Continue to Payment'
                        )}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="payment"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard size={18} className="text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">Payment</h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Order ID: <span className="font-mono">{orderId}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
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
                        className="w-full mt-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Back to Shipping
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:w-1/3">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={18} className="text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.items.map((item) => {
                    const product = item.productId || {};
                    return (
                      <div key={product._id || item._id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {product.name || 'Product'}
                        </span>
                        <span className="font-medium text-gray-800">
                          {formatPrice(item.priceAtAdd * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping ({shippingDistance ? shippingDistance.toFixed(1) : 0} km)</span>
                    <span className="text-gray-800">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {step === 'payment' && (
                  <div className="mt-6 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                    <CreditCard size={16} className="flex-shrink-0" />
                    <span>Payment is secured by Stripe</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;