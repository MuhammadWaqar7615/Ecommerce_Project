import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import { createOrder, getOrderById } from '../../services/order';
import { getStripePublicKey } from '../../services/payment';
import { getProductById } from '../../services/product';
import StripePaymentForm from '../../components/common/StripePaymentForm';
import { formatPrice } from '../../utils/formatPrice';
import { getShopLocationById, getShop } from '../../services/vendor';
import { getLocationSuggestions, calculateDistance } from '../../utils/locationApi';
import { getSettings } from '../../services/admin';
import useDebounce from '../../hooks/useDebounce';
import { Truck, MapPin, CreditCard, ShoppingBag, ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const PENDING_CHECKOUT_KEY = 'pendingCheckoutPayment';
const PENDING_CHECKOUT_MAX_AGE = 24 * 60 * 60 * 1000;

const clearPendingCheckoutSnapshot = () => {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
};

const readPendingCheckoutSnapshot = () => {
  try {
    const rawSnapshot = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!rawSnapshot) return null;
    const snapshot = JSON.parse(rawSnapshot);
    const isExpired = !snapshot.createdAt || Date.now() - snapshot.createdAt > PENDING_CHECKOUT_MAX_AGE;
    if (!snapshot.orderId || isExpired) {
      clearPendingCheckoutSnapshot();
      return null;
    }
    return snapshot;
  } catch (error) {
    console.error('Error reading pending checkout snapshot:', error);
    clearPendingCheckoutSnapshot();
    return null;
  }
};

const writePendingCheckoutSnapshot = (snapshot) => {
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({
    ...snapshot,
    createdAt: Date.now(),
  }));
};

const buildOrderSummaryFromOrder = (order) => ({
  items: (order.items || []).map((item) => {
    const product = item.productId || {};
    const price = item.price ?? product.price ?? 0;
    return {
      id: product._id || item._id || `${product.name}-${item.quantity}`,
      name: product.name || 'Product',
      quantity: item.quantity || 0,
      price,
      lineTotal: price * (item.quantity || 0),
    };
  }),
  subtotal: Math.max((order.totalAmount || 0) - (order.shippingFee || 0), 0),
  shippingFee: order.shippingFee || 0,
  shippingDistance: order.estimatedDistance || 0,
  total: order.totalAmount || 0,
});

const buildOrderSummaryFromCart = (cart, shippingFee, shippingDistance) => {
  const items = (cart?.items || []).map((item) => {
    const product = item.productId || {};
    const price = item.priceAtAdd || product.price || 0;
    return {
      id: product._id || item._id,
      name: product.name || 'Product',
      quantity: item.quantity || 0,
      price,
      lineTotal: price * (item.quantity || 0),
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    items,
    subtotal,
    shippingFee,
    shippingDistance,
    total: subtotal + shippingFee,
  };
};

const buildOrderSummaryFromDirectProduct = (product, quantity, shippingFee, shippingDistance) => {
  const price = product.price || 0;
  const item = {
    id: product._id,
    name: product.name,
    quantity,
    price,
    lineTotal: price * quantity,
  };
  const subtotal = item.lineTotal;
  return {
    items: [item],
    subtotal,
    shippingFee,
    shippingDistance,
    total: subtotal + shippingFee,
  };
};

const Checkout = () => {
  const { cart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  
  // Load user's saved address
  const userAddress = user?.address || {};
  const [shippingAddress, setShippingAddress] = useState({
    city: userAddress.city || '',
    address: userAddress.street || '',
    latitude: userAddress.latitude || null,
    longitude: userAddress.longitude || null,
    cityLat: userAddress.latitude || null,
    cityLng: userAddress.longitude || null,
  });
  const [citySearchTerm, setCitySearchTerm] = useState(userAddress.city || '');
  
  // New flag to prevent suggestions on page load
  const [cityInputFocused, setCityInputFocused] = useState(false);
  
  const [shopsLocation, setShopsLocation] = useState([]);
  const [adminSettings, setAdminSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [shippingDistance, setShippingDistance] = useState(0);
  const lastCalculatedRef = useRef('');
  const stripeKeyRequestRef = useRef(false);
  const [restoringCheckout, setRestoringCheckout] = useState(true);
  const [restoredOrderSummary, setRestoredOrderSummary] = useState(null);
  
  const queryParams = new URLSearchParams(location.search);
  const urlProductId = queryParams.get('productId');
  const urlShopId = queryParams.get('shopId');
  const urlQuantity = parseInt(queryParams.get('quantity'), 10);
  const isDirectCheckout = !!(urlProductId && urlShopId && urlQuantity > 0);
  
  const [directProductCheckout, setDirectProductCheckout] = useState(null);
  const [loadingDirectProduct, setLoadingDirectProduct] = useState(false);
  const [directCheckoutError, setDirectCheckoutError] = useState(null);
  
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [step, setStep] = useState('shipping');
  const [orderId, setOrderId] = useState(null);
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(false);
  
  const debouncedCitySearchTerm = useDebounce(citySearchTerm, 500);
  
  const getShopIdFromItem = (item) => {
    if (item.productId?.shopId) return item.productId.shopId;
    if (item.shopId) return item.shopId;
    if (item.vendorId) return item.vendorId;
    return null;
  };
  
  // Fetch direct product data if needed
  useEffect(() => {
    if (isDirectCheckout) {
      setLoadingDirectProduct(true);
      setDirectCheckoutError(null);
      const fetchDirectProductData = async () => {
        try {
          const [productResponse, shopLocResponse] = await Promise.all([
            getProductById(urlProductId),
            getShopLocationById(urlShopId)
          ]);
          if (productResponse?.product && shopLocResponse) {
            setDirectProductCheckout({
              product: productResponse.product,
              shop: { ...shopLocResponse, _id: urlShopId },
              quantity: urlQuantity,
            });
          } else {
            setDirectCheckoutError('Product or shop not found.');
          }
        } catch (error) {
          console.error('Error fetching direct checkout data:', error);
          setDirectCheckoutError('Failed to load product details.');
        } finally {
          setLoadingDirectProduct(false);
        }
      };
      fetchDirectProductData();
    } else {
      setDirectProductCheckout(null);
    }
  }, [isDirectCheckout, urlProductId, urlShopId, urlQuantity]);
  
  // Fetch shop locations
  useEffect(() => {
    const fetchLocations = async () => {
      let idsToFetch = [];
      if (directProductCheckout?.shop?._id) {
        idsToFetch = [directProductCheckout.shop._id];
      } else if (!cartLoading && cart?.items && cart.items.length > 0) {
        idsToFetch = cart.items.map(item => getShopIdFromItem(item)).filter(Boolean);
      }
      const uniqueShopIds = [...new Set(idsToFetch)].filter(id => id && id !== 'undefined');
      if (uniqueShopIds.length === 0) {
        setShopsLocation([]);
        return;
      }
      try {
        const locations = await Promise.all(uniqueShopIds.map(id => getShopLocationById(id)));
        setShopsLocation(locations.filter(loc => loc !== null));
      } catch (error) {
        console.error('Error fetching shop locations:', error);
      }
    };
    fetchLocations();
  }, [cartLoading, cart?.items, directProductCheckout]);
  
  // Admin settings
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
  
  // City suggestions - only when input is focused
  useEffect(() => {
    if (!cityInputFocused) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }
    if (debouncedCitySearchTerm.length > 2) {
      const fetchSuggestions = async () => {
        const suggestions = await getLocationSuggestions(debouncedCitySearchTerm, {
          limit: 5,
          country: 'pk',
          types: 'place'
        });
        setCitySuggestions(suggestions);
        setShowCitySuggestions(suggestions.length > 0);
      };
      fetchSuggestions();
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  }, [debouncedCitySearchTerm, cityInputFocused]);
  
  // Distance calculation
  useEffect(() => {
    const calculateDistanceNow = async () => {
      const targetLat = shippingAddress.latitude ?? shippingAddress.cityLat;
      const targetLng = shippingAddress.longitude ?? shippingAddress.cityLng;
      if (!targetLat || !targetLng) {
        setShippingDistance(0);
        return;
      }
      if (!shopsLocation.length || !adminSettings) return;
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
        const maxDistance = adminSettings.max_distance_for_delivery || 0;
        const limitedDistance = Math.min(distData.distance, maxDistance);
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
    shopsLocation,
    adminSettings
  ]);
  
  // Restore pending checkout
  useEffect(() => {
    let isMounted = true;
    const restorePendingCheckout = async () => {
      const snapshot = readPendingCheckoutSnapshot();
      if (!snapshot) {
        if (isMounted) setRestoringCheckout(false);
        return;
      }
      try {
        const data = await getOrderById(snapshot.orderId);
        const order = data.order;
        if (!order || order.paymentStatus !== 'Pending') {
          clearPendingCheckoutSnapshot();
          if (isMounted) {
            setRestoredOrderSummary(null);
            setOrderId(null);
            setStep('shipping');
          }
          return;
        }
        if (isMounted) {
          setRestoredOrderSummary(buildOrderSummaryFromOrder(order));
          setShippingAddress((prev) => ({
            ...prev,
            ...snapshot.shippingAddress,
          }));
          setShippingDistance(order.estimatedDistance || snapshot.shippingDistance || 0);
          setOrderId(order._id);
          setStep('payment');
        }
      } catch (error) {
        console.error('Failed to restore pending checkout:', error);
        clearPendingCheckoutSnapshot();
        if (isMounted) {
          setRestoredOrderSummary(null);
          setOrderId(null);
          setStep('shipping');
        }
      } finally {
        if (isMounted) setRestoringCheckout(false);
      }
    };
    restorePendingCheckout();
    return () => { isMounted = false; };
  }, []);
  
  // Load Stripe key when payment step is reached
  useEffect(() => {
    if (step !== 'payment' || stripePublicKey || stripeKeyRequestRef.current) return;
    let isMounted = true;
    stripeKeyRequestRef.current = true;
    const fetchStripeKey = async () => {
      setLoadingKey(true);
      try {
        const publicKey = await getStripePublicKey();
        if (isMounted) setStripePublicKey(publicKey);
      } catch (error) {
        console.error('Failed to load Stripe key:', error);
        alert('Failed to load payment form. Please try again.');
        clearPendingCheckoutSnapshot();
        if (isMounted) {
          setRestoredOrderSummary(null);
          setStep('shipping');
        }
      } finally {
        stripeKeyRequestRef.current = false;
        if (isMounted) setLoadingKey(false);
      }
    };
    fetchStripeKey();
    return () => { isMounted = false; };
  }, [step, stripePublicKey]);
  
  const shippingBaseFee = adminSettings?.shipping_base_fee || 0;
  const shippingPerKmRate = adminSettings?.shipping_per_km_rate || 0;
  const maxDistanceForDelivery = adminSettings?.max_distance_for_delivery || 0;
  const shippingFee = shippingBaseFee + Math.ceil(shippingDistance) * shippingPerKmRate;
  
  let currentOrderSummary = null;
  if (directProductCheckout) {
    currentOrderSummary = buildOrderSummaryFromDirectProduct(
      directProductCheckout.product,
      directProductCheckout.quantity,
      shippingFee,
      shippingDistance
    );
  } else if (cart?.items?.length > 0) {
    currentOrderSummary = buildOrderSummaryFromCart(cart, shippingFee, shippingDistance);
  } else {
    currentOrderSummary = { items: [], subtotal: 0, shippingFee: 0, shippingDistance: 0, total: 0 };
  }
  const orderSummary = restoredOrderSummary || currentOrderSummary;
  const dataReady = shopsLocation.length > 0 && adminSettings !== null && (directProductCheckout || (cart?.items?.length > 0 && !cartLoading));
  const subtotal = orderSummary.subtotal;
  const displayShippingFee = orderSummary.shippingFee;
  const displayShippingDistance = orderSummary.shippingDistance;
  const total = orderSummary.total;
  
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
  
  const handleCityFocus = () => {
    setCityInputFocused(true);
    // If the input already has content and is focused, trigger suggestions
    if (citySearchTerm.length > 2) {
      setShowCitySuggestions(true);
    }
  };
  
  const handleCityBlur = () => {
    // Delay to allow click on suggestion to register
    setTimeout(() => {
      setCityInputFocused(false);
      setShowCitySuggestions(false);
    }, 150);
  };
  
  const handleCitySuggestionClick = (suggestion) => {
    setShippingAddress((prev) => ({
      ...prev,
      city: suggestion.text,
      cityLat: suggestion.latitude,
      cityLng: suggestion.longitude,
      address: suggestion.placeName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
    setCitySearchTerm(suggestion.text);
    setShowCitySuggestions(false);
    setCityInputFocused(false);
  };
  
  const handleAddressInputChange = (e) => {
    setShippingAddress((prev) => ({ ...prev, address: e.target.value }));
  };
  
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
      const itemsForOrder = directProductCheckout
        ? [{
            productId: directProductCheckout.product._id,
            quantity: directProductCheckout.quantity,
            price: directProductCheckout.product.price,
            shopId: directProductCheckout.shop._id,
          }]
        : (cart?.items || []).map(item => ({
            productId: item.productId._id || item.productId,
            quantity: item.quantity,
            price: item.priceAtAdd || item.productId.price,
            shopId: getShopIdFromItem(item),
          }));
      const orderData = {
        items: itemsForOrder,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          latitude: finalLat,
          longitude: finalLng
        },
        shippingDistance,
      };
      const order = await createOrder(orderData);
      const createdOrder = order?.order;
      if (!createdOrder?._id) {
        throw new Error('Order was created without an ID');
      }
      writePendingCheckoutSnapshot({
        orderId: createdOrder._id,
        total: createdOrder.totalAmount || total,
        shippingFee: createdOrder.shippingFee || shippingFee,
        shippingDistance,
        shippingAddress,
        items: orderSummary.items,
      });
      setOrderId(createdOrder._id);
      setRestoredOrderSummary(null);
      setStep('payment');
    } catch (error) {
      alert(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePaymentSuccess = (redirectUrl) => {
    clearPendingCheckoutSnapshot();
    window.location.href = redirectUrl;
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };
  
  const handleBackToShipping = () => {
    clearPendingCheckoutSnapshot();
    setRestoredOrderSummary(null);
    setStep('shipping');
    setOrderId(null);
  };
  
  const handleBackToCart = () => {
    clearPendingCheckoutSnapshot();
    if (directProductCheckout) {
      navigate('/');
    } else {
      navigate('/cart');
    }
  };
  
  // Redirect if cart is empty (non-direct checkout) and not in payment step
  useEffect(() => {
    if (!loadingDirectProduct && !cartLoading && !restoringCheckout && step !== 'payment') {
      if (!isDirectCheckout && (!cart?.items || cart.items.length === 0)) {
        navigate('/cart');
      }
    }
  }, [loadingDirectProduct, cartLoading, restoringCheckout, isDirectCheckout, cart?.items, step, navigate]);
  
  if (cartLoading || loadingSettings || restoringCheckout || loadingDirectProduct) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading checkout..." />
      </div>
    );
  }
  
  if (directCheckoutError && !restoringCheckout) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-800 mb-2">Checkout Error</h2>
          <p className="text-gray-500 mb-6">{directCheckoutError}</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!directProductCheckout && (!cart?.items || cart.items.length === 0) && step !== 'payment') {
    return null;
  }
  
  if (shopsLocation.length === 0 && (cart?.items?.length > 0 || directProductCheckout)) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-800 mb-2">Unable to calculate delivery</h2>
          <p className="text-gray-500 mb-6">Shop information is missing. Please contact support.</p>
          <button onClick={handleBackToCart} className="btn-primary w-full">
            {directProductCheckout ? 'Go to Home' : 'Back to Cart'}
          </button>
        </div>
      </div>
    );
  }
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };
  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="bg-gray-50/30 min-h-screen py-8 md:py-12 mt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={handleBackToCart}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">{directProductCheckout ? 'Go to Home' : 'Back to Cart'}</span>
          </button>
        </div>
  
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your purchase securely</p>
        </div>
  
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              {step === 'shipping' ? (
                <MotionDiv
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
                          onFocus={handleCityFocus}
                          onBlur={handleCityBlur}
                        />
                        {showCitySuggestions && citySuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {citySuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition"
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur
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
                          disabled={!shippingAddress.cityLat && !shippingAddress.latitude}
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
  
                      <MotionButton
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting || (!shippingAddress.cityLat && !shippingAddress.latitude)}
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
                      </MotionButton>
                    </form>
                  </div>
                </MotionDiv>
              ) : (
                <MotionDiv
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
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
  
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <MotionDiv
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
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {orderSummary.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium text-gray-800">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping ({displayShippingDistance ? displayShippingDistance.toFixed(1) : 0} km)</span>
                    <span className="text-gray-800">{formatPrice(displayShippingFee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                {step === 'payment' && (
                  <div className="mt-6 p-3 bg-secondary/30 border border-primary/50 rounded-lg text-sm text-primary flex items-center gap-2">
                    <CreditCard size={16} className="flex-shrink-0" />
                    <span>Payment is secured by Stripe</span>
                  </div>
                )}
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default Checkout;