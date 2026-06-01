import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLoader from '../common/AnimatedLoader';
import AlertConfirmation from '../common/AlertConfirmation';
import { Save, Building, Edit, CheckCircle, XCircle, AlertCircle, Store } from 'lucide-react';
import { getShop, createShop, updateShop } from '../../services/vendor';
import { getLocationSuggestions } from '../../utils/locationApi';

const ShopManagement = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    location: {
      address: '',
    },
  });
  const [originalData, setOriginalData] = useState({});
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
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

  const formFieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const data = await getShop();
      const shopData = data.shop;
      setShop(shopData);
      console.log('Fetched shop data:', shopData);
      const newFormData = {
        shopName: shopData.shopName || '',
        description: shopData.description || '',
        contactPhone: shopData.contactPhone || '',
        contactEmail: shopData.contactEmail || '',
        location: {
          address: shopData.location?.address || '',
          latitude: shopData.location?.latitude || null,
          longitude: shopData.location?.longitude || null,
          state: shopData.location?.state || '',
        } || '',
      };
      setFormData(newFormData);
      setOriginalData(newFormData);
    } catch (error) {
      console.error('No shop found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    if(e.target.name === 'location') {
      setFormData({ ...formData, location: { ...formData.location, address: e.target.value } });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    if (e.target.name === 'location' && e.target.value.length > 2) {
      const results = await getLocationSuggestions(e.target.value);
      console.log('Location suggestions:', results);
      setSuggestions(results);
      setShowSuggestion(true);
    } else {
      setSuggestions([]);
      setShowSuggestion(false);
    }

    const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);
    setHasChanges(isChanged);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        await updateShop(formData);
        setOriginalData({ ...formData });
        setHasChanges(false);
        alert('Shop updated successfully!');
      } else {
        await createShop(formData);
        alert('Shop created successfully!');
        await fetchShop();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData({ ...originalData });
    setHasChanges(false);
    setShowDiscardAlert(false);
  };

const handleSuggestionClick = (suggestion) => {
  setFormData({ ...formData, location: { ...formData.location, address: suggestion.placeName, latitude: suggestion.latitude, longitude: suggestion.longitude, state: suggestion.context?.find(ctx => ctx.id.startsWith('region'))?.text || '' } });
  setShowSuggestion(false);
};

  // Centered loader while loading
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading Content..." />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-center gap-3 p-6 border-b border-gray-100">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Store size={24} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {shop ? 'Edit Your Shop' : 'Create Your Shop'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {shop ? 'Update your store information' : 'Set up your store to start selling'}
          </p>
        </div>
      </motion.div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl">
          <motion.div variants={containerVariants} className="space-y-5">
            {/* Shop Name */}
            <motion.div variants={formFieldVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shopName"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g., Khanewal Traditional Crafts"
              />
            </motion.div>

            {/* Description */}
            <motion.div variants={formFieldVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your shop, what you sell, your story..."
              />
            </motion.div>

            {/* Contact Fields Grid */}
            <motion.div variants={formFieldVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="03001234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="shop@example.com"
                />
              </div>
            </motion.div>

            {/* Location */}
            <motion.div variants={formFieldVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                value={formData.location?.address || ''}
                onChange={handleChange}
                placeholder="e.g., Khanewal, Punjab, Pakistan"
              />
              {showSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-blue-100flex flex-col border border-blue-200 rounded-lg"
                >
                        {suggestions.map(suggestion => (
                          <div
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion.placeName}
                          </div>
                        ))}
                </motion.div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={formFieldVariants} className="flex flex-wrap gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving || (shop && !hasChanges)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${saving || (shop && !hasChanges)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white shadow-sm hover:bg-primary-dark'
                  }`}
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
              </motion.button>

              {shop && hasChanges && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowDiscardAlert(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <XCircle size={18} />
                  Discard Changes
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </form>

        {/* Shop Status Banner */}
        {shop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Shop Active</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Your shop is live and visible to customers.
                </p>
                <p className="text-xs text-emerald-600 mt-2">
                  📦 Manage your products from the <strong>Products</strong> tab
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AlertConfirmation for Discard Changes */}
      <AlertConfirmation
        isOpen={showDiscardAlert}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleDiscard}
        onCancel={() => setShowDiscardAlert(false)}
      />
    </motion.div>
  );
};

export default ShopManagement;