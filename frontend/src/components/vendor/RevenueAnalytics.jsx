import React, { useState, useEffect } from 'react';
import { getRevenueAnalytics } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';

const RevenueAnalytics = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const result = await getRevenueAnalytics(period);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Revenue Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input-field w-32"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <h3 className="text-sm opacity-90">Total Earnings</h3>
          <p className="text-3xl font-bold">{formatPrice(data?.totalEarnings || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <h3 className="text-sm opacity-90">Total Orders</h3>
          <p className="text-3xl font-bold">{data?.totalOrders || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <h3 className="text-sm opacity-90">Average Order Value</h3>
          <p className="text-3xl font-bold">{formatPrice(data?.averageOrderValue || 0)}</p>
        </div>
      </div>

      {data?.earningsByProduct && data.earningsByProduct.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Earnings by Product</h3>
          <div className="space-y-3">
            {data.earningsByProduct.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.productName}</p>
                  <p className="text-sm text-gray-500">Sold: {product.quantity} units</p>
                </div>
                <p className="font-semibold text-primary">{formatPrice(product.earnings)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.earningsByProduct?.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No sales data available for this period.</p>
          <p className="text-sm mt-2">Orders will appear here once customers purchase your products.</p>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;