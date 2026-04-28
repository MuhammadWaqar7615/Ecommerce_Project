import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getOrders } from '../services/order';
import { formatPrice } from '../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, DollarSign, Clock } from 'lucide-react';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const data = await getOrders();
      const orders = data.orders || [];
      
      // Calculate stats
      const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
      const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
      
      setStats({
        totalOrders: orders.length,
        totalSpent,
        activeOrders,
        deliveredOrders
      });
      
      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Dashboard" subtitle="Welcome to your dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Dashboard" subtitle="Welcome to your dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <ShoppingBag size={32} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Spent</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(stats.totalSpent)}</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.activeOrders}</p>
            </div>
            <Clock size={32} className="opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Delivered</p>
              <p className="text-3xl font-bold mt-1">{stats.deliveredOrders}</p>
            </div>
            <Package size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/customer/orders" className="text-primary hover:underline text-sm">
            View All →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary inline-block mt-4">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/customer/orders/${order._id}`} 
                        className="text-primary hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;