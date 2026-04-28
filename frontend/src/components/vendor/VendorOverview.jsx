import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Store, TrendingUp } from 'lucide-react';

const VendorOverview = () => {
  const [stats, setStats] = useState({
    shop: null,
    productsCount: 0,
    ordersCount: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      let shopData = null;
      try {
        const shopResult = await import('../../services/vendor').then(m => m.getShop());
        shopData = shopResult?.shop || null;
      } catch (err) {
        console.log('No shop found - vendor needs to create one');
      }

      let productsCount = 0;
      let ordersCount = 0;
      let totalEarnings = 0;

      if (shopData) {
        try {
          const productsData = await import('../../services/vendor').then(m => m.getVendorProducts());
          productsCount = productsData.products?.length || 0;
        } catch (err) {
          console.error('Error fetching products:', err);
        }

        try {
          const ordersData = await import('../../services/vendor').then(m => m.getVendorOrders());
          ordersCount = ordersData.orders?.length || 0;
        } catch (err) {
          console.error('Error fetching orders:', err);
        }

        try {
          const revenueData = await import('../../services/vendor').then(m => m.getRevenueAnalytics('month'));
          totalEarnings = revenueData.totalEarnings || 0;
        } catch (err) {
          console.error('Error fetching revenue:', err);
        }
      }

      setStats({
        shop: shopData,
        productsCount,
        ordersCount,
        totalEarnings,
      });
    } catch (error) {
      console.error('Error fetching overview:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading dashboard: {error}
        </div>
        <button onClick={fetchOverviewData} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Welcome to Your Vendor Dashboard</h2>

      {!stats.shop && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
          <Store className="mx-auto mb-3 text-blue-500" size={48} />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Create Your Shop</h3>
          <p className="text-blue-600 mb-4">You haven't created a shop yet. Click below to get started and start selling!</p>
          <button
            onClick={() => {
              const shopTab = document.querySelector('[data-tab="shop"]');
              if (shopTab) shopTab.click();
            }}
            className="btn-primary"
          >
            Create Shop Now
          </button>
        </div>
      )}

      {stats.shop && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <Store className="mb-2" size={24} />
            <h3 className="text-sm opacity-90">My Shop</h3>
            <p className="text-lg font-bold">{stats.shop.shopName}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <Package className="mb-2" size={24} />
            <h3 className="text-sm opacity-90">Total Products</h3>
            <p className="text-2xl font-bold">{stats.productsCount}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <ShoppingBag className="mb-2" size={24} />
            <h3 className="text-sm opacity-90">Total Orders</h3>
            <p className="text-2xl font-bold">{stats.ordersCount}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
            <TrendingUp className="mb-2" size={24} />
            <h3 className="text-sm opacity-90">Total Earnings</h3>
            <p className="text-2xl font-bold">PKR {stats.totalEarnings?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {!stats.shop && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Getting Started:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>1️⃣ Click on <strong>"My Shop"</strong> tab to create your shop</li>
            <li>2️⃣ Add your shop details (name, description, contact info)</li>
            <li>3️⃣ Go to <strong>"Products"</strong> tab to add your products</li>
            <li>4️⃣ Start receiving orders from customers!</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VendorOverview;