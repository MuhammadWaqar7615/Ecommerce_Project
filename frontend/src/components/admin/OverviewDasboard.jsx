import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShoppingBag, Package, DollarSign, TrendingUp, Eye,
  Calendar, CheckCircle, Clock, XCircle, ArrowUp, ArrowDown,
  Activity, CreditCard, Truck, Star
} from 'lucide-react';
import { getSystemStats } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';
import { Link } from 'react-router-dom';

const OverviewDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStats();
    console.log('fetch stats: ', fetchStats);
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, type: "spring", stiffness: 300 } },
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200"
      >
        <XCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Analytics</h3>
        <p className="text-red-600">Please check your connection and try again</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchStats}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  const mainStats = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      trend: '+23.5%',
      trendUp: true,
      subtitle: 'Platform commission'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-600',
      trend: '+18.2%',
      trendUp: true,
      subtitle: `${stats.orders?.pending || 0} pending`
    },
    {
      title: 'Active Users',
      value: stats.totalUsers || 0,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      trend: '+12.3%',
      trendUp: true,
      subtitle: `${stats.users?.customers || 0} customers`
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      gradient: 'from-orange-500 to-red-600',
      trend: '-2.1%',
      trendUp: false,
      subtitle: `${stats.products?.active || 0} active`
    },
  ];

  const secondaryStats = [
    {
      label: 'Average Order Value',
      value: formatPrice(stats.averageOrderValue || 0),
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate || 78}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Active Vendors',
      value: stats.users?.vendors?.active || 0,
      icon: Store,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Avg. Delivery Time',
      value: `${stats.avgDeliveryTime || 3.5} days`,
      icon: Truck,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Delivered: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Processing: 'bg-blue-100 text-blue-700',
      Shipped: 'bg-indigo-100 text-indigo-700',
      Cancelled: 'bg-rose-100 text-rose-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Delivered: <CheckCircle size={12} />,
      Pending: <Clock size={12} />,
      Processing: <Package size={12} />,
      Shipped: <Truck size={12} />,
      Cancelled: <XCircle size={12} />,
    };
    return icons[status] || <Clock size={12} />;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header with Time Filter */}
      <motion.div
        variants={statCardVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${timeRange === range
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Stats Cards - Updated Design */}
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
              <p className="text-sm text-gray-500">Total Revenue</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="text-2xl font-bold text-gray-800"
              >
                {formatPrice(stats.totalRevenue || 0)}
              </motion.p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"
            >
              <DollarSign size={20} className="text-green-500" />
            </motion.div>
          </div>
        </motion.div>

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
                {stats.totalOrders || 0}
              </motion.p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"
            >
              <ShoppingBag size={20} className="text-blue-500" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={statCardVariants}
          whileHover="hover"
          className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="text-2xl font-bold text-gray-800"
              >
                {stats.totalUsers || 0}
              </motion.p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"
            >
              <Users size={20} className="text-purple-500" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={statCardVariants}
          whileHover="hover"
          className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="text-2xl font-bold text-gray-800"
              >
                {stats.totalProducts || 0}
              </motion.p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"
            >
              <Package size={20} className="text-orange-500" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Secondary Stats Grid */}
      <motion.div
        variants={chartVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={statCardVariants}
              whileHover={{ scale: 1.02, y: -3 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={16} className={stat.color} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TrendingUp size={14} className="text-green-500" />
                </motion.div>
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: index * 0.05 }}
                className="text-xl font-bold text-gray-800 mt-1"
              >
                {stat.value}
              </motion.p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Orders Section */}
      <motion.div
        variants={chartVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Activity size={20} className="text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
            </div>
            <p className="text-sm text-gray-500">Latest orders and their status</p>
          </div>
          <Link to="/admin/orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <Eye size={16} />
              View All Orders
            </motion.button>
          </Link>
        </div>

        <AnimatePresence>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.slice(0, 5).map((order, index) => (
                    <motion.tr
                      key={order._id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center"
                          >
                            <Users size={14} className="text-primary" />
                          </motion.div>
                          <span className="text-sm text-gray-700">
                            {order.customerId?.fullName || 'Guest User'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className="text-sm font-bold text-gray-900"
                        >
                          {formatPrice(order.totalAmount)}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.4 }}
                        >
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye size={16} />
                          </Link>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <ShoppingBag size={40} className="text-gray-400" />
              </motion.div>
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start shopping</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Insights Banner */}
      <motion.div
        variants={chartVariants}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center"
            >
              <Star size={20} className="text-primary" />
            </motion.div>
            <div>
              <h4 className="font-semibold text-gray-800">Platform Health Score</h4>
              <p className="text-sm text-gray-600">Overall platform performance is excellent</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="text-right"
            >
              <p className="text-2xl font-bold text-primary">92%</p>
              <p className="text-xs text-gray-500">Satisfaction Rate</p>
            </motion.div>
            <div className="w-px h-8 bg-gray-300"></div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              className="text-right"
            >
              <p className="text-2xl font-bold text-green-600">4.8</p>
              <p className="text-xs text-gray-500">Avg. Rating</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Missing Store icon import
const Store = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default OverviewDashboard;