import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLoader from '../common/AnimatedLoader';
import {
  Store, Package, ShoppingBag, TrendingUp, DollarSign, Users,
  Clock, CheckCircle, Eye, Calendar, Activity, Truck, Star
} from 'lucide-react';
import { getShop, getVendorProducts, getVendorOrders, getRevenueAnalytics } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';
import { Link } from 'react-router-dom';

const VendorOverview = () => {
  const [stats, setStats] = useState({
    shop: null,
    productsCount: 0,
    ordersCount: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    activeProducts: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, type: "spring", stiffness: 300 } },
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const numberVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 10 } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { backgroundColor: "rgba(0,0,0,0.02)" }
  };

  const fetchOverviewData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let shopData = null;
      try {
        const shopResult = await getShop();
        shopData = shopResult?.shop || null;
      } catch (err) { }

      let productsCount = 0;
      let activeProducts = 0;
      let ordersCount = 0;
      let pendingOrders = 0;
      let totalEarnings = 0;
      let averageOrderValue = 0;
      let recentOrders = [];

      if (shopData) {
        // Products
        try {
          const productsData = await getVendorProducts();
          const products = productsData.products || [];
          productsCount = products.length;
          activeProducts = products.filter(p => p.status === 'active').length;
        } catch (err) { }

        // Orders
        try {
          const ordersData = await getVendorOrders();
          const orders = ordersData.orders || [];
          ordersCount = orders.length;
          pendingOrders = orders.filter(o => o.status === 'pending').length;
          recentOrders = orders.slice(0, 5);

          const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
          if (completedOrders.length > 0) {
            const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            averageOrderValue = totalRevenue / completedOrders.length;
          }
        } catch (err) { }

        // Earnings
        try {
          const revenueData = await getRevenueAnalytics(timeRange);
          totalEarnings = revenueData.totalEarnings || 0;
        } catch (err) { }
      }

      setStats({
        shop: shopData,
        productsCount,
        activeProducts,
        ordersCount,
        pendingOrders,
        totalEarnings,
        averageOrderValue,
        recentOrders
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading Content..." />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100"
      >
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchOverviewData}
          className="mt-6 px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition"
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  if (!stats.shop) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your store, track orders and earnings</p>
          </div>
        </div>
        <motion.div
          variants={statCardVariants}
          className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
        >
          <Store size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No shop found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Create your shop to start listing products and receiving orders.
          </p>
          <Link to="/vendor/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition"
            >
              Create Shop Now
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // Main stats – all from vendor data, no admin APIs
  const mainStats = [
    {
      title: 'Total Earnings',
      value: formatPrice(stats.totalEarnings || 0),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: `Last ${timeRange}`
    },
    {
      title: 'Total Orders',
      value: stats.ordersCount,
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: `${stats.pendingOrders} pending`
    },
    {
      title: 'Avg. Order Value',
      value: formatPrice(stats.averageOrderValue || 0),
      icon: TrendingUp,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      subtitle: 'Per completed order'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Package,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      subtitle: `Out of ${stats.productsCount} total`
    }
  ];

  const getStatusColor = (status) => ({
    Delivered: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-indigo-100 text-indigo-700',
    Cancelled: 'bg-rose-100 text-rose-700'
  }[status] || 'bg-gray-100 text-gray-700');

  const getStatusIcon = (status) => {
    const icons = {
      Delivered: <CheckCircle size={12} />,
      Completed: <CheckCircle size={12} />,
      Pending: <Clock size={12} />,
      Processing: <Package size={12} />,
      Shipped: <Truck size={12} />,
      Cancelled: <XCircle size={12} />
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
          <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store, track orders and earnings</p>
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

      {/* Main Stats Cards – all real vendor data */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={statCardVariants}
              whileHover="hover"
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <motion.p
                    variants={numberVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: idx * 0.05 }}
                    className="text-2xl font-bold text-gray-800 truncate max-w-[160px]"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={20} className={stat.textColor} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div
        variants={statCardVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            </div>
            <p className="text-sm text-gray-500">Latest transactions from your shop</p>
          </div>
          <Link to="/vendor/orders">
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
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-gray-900">#{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users size={14} className="text-primary" />
                          </div>
                          <span className="text-sm text-gray-700">{order.customerId?.fullName || 'Guest'}</span>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <ShoppingBag size={40} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear once customers start buying</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Shop Performance Banner – using real data */}
      {(stats.activeProducts > 0 || stats.ordersCount > 0) && (
        <motion.div
          variants={statCardVariants}
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
                <h4 className="font-semibold text-gray-800">{stats.shop.shopName}</h4>
                <p className="text-sm text-gray-600">
                  {stats.ordersCount > 0
                    ? `${stats.ordersCount} orders processed, ${stats.activeProducts} products active`
                    : `${stats.activeProducts} products available for sale`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="text-2xl font-bold text-primary"
                >
                  {stats.activeProducts}
                </motion.p>
                <p className="text-xs text-gray-500">Active Products</p>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-right">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                  className="text-2xl font-bold text-green-600"
                >
                  {stats.ordersCount}
                </motion.p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Helper component for error icon
const XCircle = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default VendorOverview;