import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { getSystemStats } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-10 text-red-500">Failed to load statistics</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      subText: `${stats.users?.customers || 0} customers, ${stats.users?.vendors?.total || 0} vendors`
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'bg-green-500',
      subText: `${stats.products?.active || 0} active`
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      subText: `${stats.orders?.pending || 0} pending, ${stats.orders?.completed || 0} completed`
    },
    {
      title: 'Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      subText: `From platform commission`
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Platform Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                  <Icon className={`${card.color.replace('bg-', 'text-')}`} size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.subText}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Preview */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button className="text-primary text-sm hover:underline">View All</button>
        </div>
        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-2 text-sm">{order.customerId?.fullName || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;