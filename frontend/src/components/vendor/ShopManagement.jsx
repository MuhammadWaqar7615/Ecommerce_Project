import React, { useState, useEffect } from 'react';
import { Save, Building } from 'lucide-react';
import { getShop, createShop, updateShop } from '../../services/vendor';

const ShopManagement = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
  });

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const data = await getShop();
      setShop(data.shop);
      setFormData({
        shopName: data.shop.shopName || '',
        description: data.shop.description || '',
        contactPhone: data.shop.contactPhone || '',
        contactEmail: data.shop.contactEmail || '',
      });
    } catch (error) {
      console.error('No shop found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        await updateShop(formData);
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

  if (loading) {
    return <div className="text-center py-10">Loading shop details...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">
        {shop ? 'Edit Your Shop' : 'Create Your Shop'}
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Shop Name *</label>
          <input
            type="text"
            name="shopName"
            required
            className="input-field"
            value={formData.shopName}
            onChange={handleChange}
            placeholder="e.g., Khanewal Traditional Crafts"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows="4"
            className="input-field"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your shop and what you sell..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone *</label>
            <input
              type="tel"
              name="contactPhone"
              required
              className="input-field"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="03001234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email *</label>
            <input
              type="email"
              name="contactEmail"
              required
              className="input-field"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="shop@example.com"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={18} className="inline mr-2" />
          {saving ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
        </button>
      </form>

      {shop && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Shop Status</h3>
          <p className="text-green-700">✓ Your shop is active and visible to customers</p>
          <p className="text-sm text-green-600 mt-2">Manage your products from the Products tab</p>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;