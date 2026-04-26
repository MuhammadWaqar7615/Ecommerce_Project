import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
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
      alert('Settings saved successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading settings...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Settings</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Commission Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={settings.commission_percentage}
              onChange={(e) => handleChange('commission_percentage', e.target.value)}
              className="input-field w-48"
            />
            <p className="text-xs text-gray-500 mt-1">Percentage deducted from each order as platform fee</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Shipping Rules</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Delivery Fee (PKR)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_base_fee}
                onChange={(e) => handleChange('shipping_base_fee', e.target.value)}
                className="input-field w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Per Kilometer Rate (PKR)</label>
              <input
                type="number"
                min="0"
                value={settings.shipping_per_km_rate}
                onChange={(e) => handleChange('shipping_per_km_rate', e.target.value)}
                className="input-field w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Delivery Distance (km)</label>
              <input
                type="number"
                min="0"
                value={settings.max_distance_for_delivery}
                onChange={(e) => handleChange('max_distance_for_delivery', e.target.value)}
                className="input-field w-48"
              />
              <p className="text-xs text-gray-500 mt-1">Orders beyond this distance will not be deliverable</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Shipping Calculation Example</h3>
          <p className="text-sm text-gray-600">
            For a delivery of <strong>10 km</strong>:
          </p>
          <p className="text-sm mt-1">
            Shipping Fee = {settings.shipping_base_fee} + (10 × {settings.shipping_per_km_rate}) = 
            <strong> PKR {settings.shipping_base_fee + (10 * settings.shipping_per_km_rate)}</strong>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 btn-primary"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;