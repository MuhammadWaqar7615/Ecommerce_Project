import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Save, Percent, Truck, MapPin, DollarSign, TrendingUp, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import { getSettings, updateSetting } from '../../services/admin';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        commission_percentage: 5,
        shipping_base_fee: 150,
        shipping_per_km_rate: 10,
        max_distance_for_delivery: 50
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState({});
    const [savedFields, setSavedFields] = useState(new Set());

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        hover: { scale: 1.01, transition: { duration: 0.2 } }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data.settings);
            setInitialSettings(data.settings);
            setIsDirty(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        const newValue = parseFloat(value) || 0;
        setSettings(prev => ({ ...prev, [key]: newValue }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!isDirty) {
            toast.info('No changes to save');
            return;
        }

        setSaving(true);
        const newSavedFields = new Set();
        
        try {
            const savePromises = Object.entries(settings).map(async ([key, value]) => {
                await updateSetting(key, value);
                newSavedFields.add(key);
                setSavedFields(new Set(newSavedFields));
                await new Promise(resolve => setTimeout(resolve, 100));
            });
            
            await Promise.all(savePromises);
            setInitialSettings(settings);
            setIsDirty(false);
            
            toast.success('Settings saved successfully!');
            
            setTimeout(() => setSavedFields(new Set()), 2000);
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(initialSettings);
        setIsDirty(false);
        toast.info('Settings reset to last saved values');
    };

    const calculateShippingExample = () => {
        const distance = 10;
        const fee = settings.shipping_base_fee + (distance * settings.shipping_per_km_rate);
        return fee;
    };

    if (loading) {
        return <AnimatedLoader size="lg" label="Loading settings..." />;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-2xl shadow-sm"
        >
            <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                hideProgressBar={false} 
                newestOnTop 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
                theme="light" 
            />

            {/* Header */}
            <motion.div variants={itemVariants} className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Configure platform commission and shipping rules</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchSettings}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Settings Content */}
            <div className="p-6 space-y-5">
                {/* Commission Section */}
                <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="p-1.5 bg-primary/10 rounded-lg"
                        >
                            <Percent size={16} className="text-primary" />
                        </motion.div>
                        <h3 className="font-semibold text-gray-800">Commission Settings</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.commission_percentage}
                                    onChange={(e) => handleChange('commission_percentage', e.target.value)}
                                    className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                />
                                <AnimatePresence>
                                    {savedFields.has('commission_percentage') && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0, x: 5 }}
                                            animate={{ opacity: 1, scale: 1, x: 5 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            className="absolute -right-6 top-1/2 -translate-y-1/2"
                                        >
                                            <CheckCircle size={16} className="text-green-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span className="text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Percentage deducted from each order as platform fee</p>
                    </div>
                </motion.div>

                {/* Shipping Rules Section */}
                <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="p-1.5 bg-primary/10 rounded-lg"
                        >
                            <Truck size={16} className="text-primary" />
                        </motion.div>
                        <h3 className="font-semibold text-gray-800">Shipping Rules</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { key: 'shipping_base_fee', label: 'Base Delivery Fee', icon: DollarSign, unit: 'PKR' },
                            { key: 'shipping_per_km_rate', label: 'Per Kilometer Rate', icon: DollarSign, unit: 'PKR per km' },
                            { key: 'max_distance_for_delivery', label: 'Max Delivery Distance', icon: MapPin, unit: 'Kilometers' }
                        ].map((field) => (
                            <motion.div 
                                key={field.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                <div className="flex items-center gap-2">
                                    <field.icon size={14} className="text-gray-400" />
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={settings[field.key]}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                        />
                                        <AnimatePresence>
                                            {savedFields.has(field.key) && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0, x: 5 }}
                                                    animate={{ opacity: 1, scale: 1, x: 5 }}
                                                    exit={{ opacity: 0, scale: 0 }}
                                                    className="absolute -right-6 top-1/2 -translate-y-1/2"
                                                >
                                                    <CheckCircle size={16} className="text-green-500" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{field.unit}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Example Calculation */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-amber-50 rounded-xl p-4 border border-amber-200 relative overflow-hidden"
                >
                    <motion.div 
                        className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="p-1.5 bg-amber-100 rounded-lg"
                        >
                            <TrendingUp size={16} className="text-amber-600" />
                        </motion.div>
                        <h3 className="font-semibold text-gray-800">Shipping Calculation Example</h3>
                    </div>
                    <p className="text-sm text-gray-600 relative z-10">
                        For a delivery of <strong className="text-amber-700">10 km</strong>:
                    </p>
                    <motion.p 
                        className="text-sm mt-1 text-gray-700 relative z-10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Shipping Fee = {settings.shipping_base_fee} + (10 × {settings.shipping_per_km_rate}) = 
                        <motion.strong 
                            className="text-primary ml-1"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                            PKR {calculateShippingExample()}
                        </motion.strong>
                    </motion.p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Settings
                            </>
                        )}
                    </motion.button>
                    
                    <AnimatePresence>
                        {isDirty && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleReset}
                                disabled={saving}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Reset
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Unsaved Changes Indicator */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 50, x: -20 }}
                        className="fixed bottom-6 left-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50"
                    >
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        You have unsaved changes
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SystemSettings;