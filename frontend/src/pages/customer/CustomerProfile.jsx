import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/common/DashboardLayout';
import { validateEmail, validatePhone } from '../../utils/validateForm';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { getLocationSuggestions as getLocationSuggestionsGeneral } from '../../utils/locationApi';

const CustomerProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: 'Khanewal',
      district: '',
      postalCode: ''
    }
  });

  // City autocomplete state
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const citySearchAbortRef = useRef(null);
  const blurTimeoutRef = useRef(null);        // for delayed hiding
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load user data
  useEffect(() => {
    if (user) {
      const nextCity = user.address?.city || 'Khanewal';
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: nextCity,
          district: user.address?.district || '',
          postalCode: user.address?.postalCode || ''
        }
      });
      setCitySearchTerm(nextCity);
      setShowCitySuggestions(false);
    }
  }, [user]);

  // Fetch city suggestions (Mapbox) – only when input is focused AND term length >= 2
  useEffect(() => {
    if (!showCitySuggestions) return; // only fetch when dropdown is supposed to be visible
    const query = citySearchTerm?.trim();
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const abortController = new AbortController();
    const fetchSuggestions = async () => {
      setCityLoading(true);
      try {
        const suggestions = await getLocationSuggestionsGeneral(query);
        if (abortController.signal.aborted) return;
        // Keep results – Mapbox already returns relevant places
        setCitySuggestions(suggestions.slice(0, 8));
      } catch (err) {
        console.error('City suggestions error:', err);
        setCitySuggestions([]);
      } finally {
        if (!abortController.signal.aborted) setCityLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [citySearchTerm, showCitySuggestions]);

  // Handlers
  const handleCityChange = (e) => {
    const value = e.target.value;
    setCitySearchTerm(value);
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, city: value }
    }));
    // ensure dropdown stays open when typing
    if (!showCitySuggestions) setShowCitySuggestions(true);
  };

  const handleCityFocus = () => {
    // cancel any pending blur timeout
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setShowCitySuggestions(true);
  };

  const handleCityBlur = () => {
    // delay hiding so that clicks on suggestions have time to register
    blurTimeoutRef.current = setTimeout(() => {
      setShowCitySuggestions(false);
    }, 150);
  };

  const handleCitySuggestionClick = (suggestion) => {
    // cancel the blur timeout to keep dropdown from closing too early
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);

    const selectedCity = suggestion.text || suggestion.placeName;
    const latitude = suggestion.latitude ?? suggestion.center?.[1] ?? null;
    const longitude = suggestion.longitude ?? suggestion.center?.[0] ?? null;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: selectedCity,
        latitude,
        longitude,
      }
    }));
    setCitySearchTerm(selectedCity);
    setShowCitySuggestions(false);
  };

  // Prevent input blur when clicking on a suggestion (using onMouseDown)
  const onSuggestionMouseDown = (e) => {
    e.preventDefault();   // keeps focus on the input
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number (10-15 digits)' });
      setLoading(false);
      return;
    }

    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // animation variants (unchanged)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account information">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Personal Information (unchanged) */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={formData.username}
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      value={formData.email}
                    />
                    <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information with fixed autocomplete */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your orders?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="House #, Street, Area"
                  />
                </div>

                {/* City field with fixed suggestions */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={citySearchTerm}
                    onChange={handleCityChange}
                    onFocus={handleCityFocus}
                    onBlur={handleCityBlur}
                    placeholder="Search for your city..."
                  />
                  {showCitySuggestions && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {cityLoading ? (
                        <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>
                      ) : citySuggestions.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-gray-500">No cities found</li>
                      ) : (
                        citySuggestions.map((s, idx) => (
                          <li
                            key={s.id || idx}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                            onMouseDown={onSuggestionMouseDown}
                            onClick={() => handleCitySuggestionClick(s)}
                          >
                            {s.text || s.placeName}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                  <input
                    type="text"
                    name="address.district"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.address.district}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="address.postalCode"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit button (unchanged) */}
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CustomerProfile;