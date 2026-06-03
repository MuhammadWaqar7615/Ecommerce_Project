import React, { useState, useEffect, useMemo } from 'react';
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

const Checkout = () => {
  const { cart, loadCart, loading: cartLoading } = useCart();
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
 const shopIds = useMemo(
  () => cart?.items?.map(item => item.productId?.shopId).filter(Boolean) || [],
  [cart?.items]
);
  const [adminSettings, setAdminSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch shop locations whenever cart is loaded and shopIds are available
useEffect(() => {
  const fetchLocations = async () => {
    // Also guard against cart.items being undefined/empty
    console.log('Cart loading:', cartLoading, 'Cart items:', cart?.items); // Debugging line
    if (cartLoading || !cart?.items || cart.items.length === 0) return;

    const ids = cart.items.map(item => item.productId?.shopId).filter(Boolean);
    if (ids.length === 0) {
      setShopsLocation([]);
      return;
    }

    const uniqueShopIds = [...new Set(ids)];
    const locations = await Promise.all(uniqueShopIds.map(id => getShopLocationById(id)));
    setShopsLocation(locations.filter(loc => loc !== null));
  };

  fetchLocations();
}, [cartLoading, cart?.items, shippingAddress.city]); // depend on cart.items directly, not derived shopIds// Dependencies ensure fetch runs when cart loads or cart items change

  const [citySearchTerm, setCitySearchTerm] = useState('');
  const debouncedCitySearchTerm = useDebounce(citySearchTerm, 500);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [shippingDistance, setShippingDistance] = useState(0);
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

  // Fetch admin settings once
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

  // Fetch city suggestions
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

  // Calculate distance when address/city changes and shops are loaded
  useEffect(() => {
    const updateDistance = async () => {
      // Wait until we have shop locations and admin settings
      if (shopsLocation.length === 0 || !adminSettings) return;

      const targetLat = shippingAddress.latitude || shippingAddress.cityLat;
      const targetLng = shippingAddress.longitude || shippingAddress.cityLng;

      if (targetLat && targetLng) {
        try {
          const shopLoc = [shopsLocation[0].location.longitude, shopsLocation[0].location.latitude];
          const distData = await calculateDistance([targetLng, targetLat], shopLoc);
          const limitedDistance = Math.min(distData.distance, maxDistanceForDelivery);
          setShippingDistance(limitedDistance);
        } catch (error) {
          console.error('Error calculating distance:', error);
          setShippingDistance(0);
        }
      } else {
        setShippingDistance(0);
      }
    };
    updateDistance();
  }, [
    shippingAddress.latitude,
    shippingAddress.longitude,
    shippingAddress.cityLat,
    shippingAddress.cityLng,
    shopsLocation,
    adminSettings,
    maxDistanceForDelivery
  ]);

  // Load Stripe public key when moving to payment step
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
    
    const finalLat = shippingAddress.latitude || shippingAddress.cityLat;
    const finalLng = shippingAddress.longitude || shippingAddress.cityLng;

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

  // Show loader while cart or settings are loading
  if (cartLoading || loadingSettings) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AnimatedLoader size="lg" label="Loading cart and settings..." />
      </div>
    );
  }

  // Redirect if cart is empty
  if (!cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {step === 'shipping' ? (
            <form onSubmit={handleSubmitShipping} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Search city..."
                    className="input-field"
                    value={citySearchTerm}
                    onChange={handleCityChange}
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {citySuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleCitySuggestionClick(suggestion)}
                        >
                          {suggestion.placeName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Full Address / Street *</label>
                  <input
                    type="text"
                    required
                    disabled={!shippingAddress.cityLat}
                    placeholder={shippingAddress.city ? "Enter street, building, area..." : "Please select city first"}
                    className="input-field disabled:bg-gray-50"
                    value={shippingAddress.address}
                    onChange={handleAddressInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Distance (km)</label>
                    <input
                      type="text"
                      readOnly
                      className="input-field bg-gray-50 cursor-not-allowed"
                      value={shippingDistance ? shippingDistance.toFixed(2) : '0'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shipping Fee</label>
                    <input
                      type="text"
                      readOnly
                      className="input-field bg-gray-50 cursor-not-allowed"
                      value={formatPrice(shippingFee)}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Shipping fee: {formatPrice(shippingBaseFee)} base + {formatPrice(shippingPerKmRate)}/km (max {maxDistanceForDelivery}km)
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !shippingAddress.cityLat}
                className="btn-primary w-full mt-6 disabled:opacity-50"
              >
                {submitting ? 'Creating order...' : 'Continue to Payment'}
              </button>
            </form>
          ) : (
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
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingDistance ? shippingDistance.toFixed(1) : 0}km)</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
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