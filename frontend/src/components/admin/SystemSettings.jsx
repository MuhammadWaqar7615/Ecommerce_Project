import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Save, Percent, Truck, MapPin, DollarSign, TrendingUp } from 'lucide-react';
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

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data.settings);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const [key, value] of Object.entries(settings)) {
                await updateSetting(key, value);
            }
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
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
        <div className="bg-white rounded-2xl shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure platform commission and shipping rules</p>
            </div>

            {/* Settings Content */}
            <div className="p-6 space-y-5">
                {/* Commission Section */}
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Percent size={16} className="text-primary" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Commission Settings</h3>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={settings.commission_percentage}
                                onChange={(e) => handleChange('commission_percentage', e.target.value)}
                                className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                            <span className="text-gray-500">%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Percentage deducted from each order as platform fee</p>
                    </div>
                </div>

                {/* Shipping Rules Section */}
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Truck size={16} className="text-primary" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Shipping Rules</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Delivery Fee</label>
                            <div className="flex items-center gap-2">
                                <DollarSign size={14} className="text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.shipping_base_fee}
                                    onChange={(e) => handleChange('shipping_base_fee', e.target.value)}
                                    className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">PKR</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Per Kilometer Rate</label>
                            <div className="flex items-center gap-2">
                                <DollarSign size={14} className="text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.shipping_per_km_rate}
                                    onChange={(e) => handleChange('shipping_per_km_rate', e.target.value)}
                                    className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">PKR per km</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Delivery Distance</label>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.max_distance_for_delivery}
                                    onChange={(e) => handleChange('max_distance_for_delivery', e.target.value)}
                                    className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Kilometers</p>
                        </div>
                    </div>
                </div>

                {/* Example Calculation */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <TrendingUp size={16} className="text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Shipping Calculation Example</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        For a delivery of <strong className="text-amber-700">10 km</strong>:
                    </p>
                    <p className="text-sm mt-1 text-gray-700">
                        Shipping Fee = {settings.shipping_base_fee} + (10 × {settings.shipping_per_km_rate}) = 
                        <strong className="text-primary ml-1">PKR {calculateShippingExample()}</strong>
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </div>
    );
};

export default SystemSettings;