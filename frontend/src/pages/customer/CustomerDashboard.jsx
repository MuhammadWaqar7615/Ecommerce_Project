import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getOrders } from '../../services/order';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, DollarSign, Clock, Eye } from 'lucide-react';

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
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, type: "spring", stiffness: 300 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Dashboard" subtitle="Welcome to your dashboard">
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Dashboard" subtitle="Welcome to your dashboard">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Statistics Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
        >
          <motion.div 
            variants={statCardVariants}
            whileHover="hover"
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {stats.totalOrders}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={statCardVariants}
            whileHover="hover"
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-2xl font-bold text-primary"
                >
                  {formatPrice(stats.totalSpent)}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={statCardVariants}
            whileHover="hover"
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-2xl font-bold text-yellow-600"
                >
                  {stats.activeOrders}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-yellow-500" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={statCardVariants}
            whileHover="hover"
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-2xl font-bold text-green-600"
                >
                  {stats.deliveredOrders}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-purple-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/customer/orders" className="text-primary hover:underline text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="p-5 transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          Order #{order.orderNumber}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>{new Date(order.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                      <Link 
                        to={`/customer/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <Eye size={12} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;