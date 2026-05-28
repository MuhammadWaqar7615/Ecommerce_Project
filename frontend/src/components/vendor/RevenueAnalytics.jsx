import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { TrendingUp, DollarSign, ShoppingBag, Package, Calendar, ChevronDown } from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import { getRevenueAnalytics } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';

const RevenueAnalytics = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, type: "spring", stiffness: 300 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { backgroundColor: "rgba(0,0,0,0.02)", transition: { duration: 0.2 } }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getRevenueAnalytics(period);
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const mainStats = [
    {
      title: 'Total Earnings',
      value: formatPrice(data?.totalEarnings || 0),
      icon: DollarSign,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      subtitle: `Last ${period}`
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      icon: ShoppingBag,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      subtitle: 'Completed orders'
    },
    {
      title: 'Avg. Order Value',
      value: formatPrice(data?.averageOrderValue || 0),
      icon: TrendingUp,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      subtitle: 'Per order'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading analytics..." />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-2xl shadow-sm"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Header with Period Filter */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Revenue Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your earnings and sales performance
          </p>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 pr-8 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border-b border-gray-100 bg-gray-50/30"
      >
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={statCardVariants}
              whileHover="hover"
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <Icon size={18} className={stat.textColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: idx * 0.05 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {stat.value}
                </motion.p>
                <p className="text-[11px] text-gray-400 mt-0.5">{stat.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Earnings by Product Section */}
      <AnimatePresence mode="wait">
        {!data?.earningsByProduct || data.earningsByProduct.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No sales data available</h3>
            <p className="text-gray-500">
              {`No orders completed during this ${period}. Sales will appear here once customers purchase your products.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-800">Earnings by Product</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Units Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.earningsByProduct.map((product, idx) => (
                    <motion.tr
                      key={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: idx * 0.03 }}
                      className="group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{product.productName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{product.quantity} units</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-primary">{formatPrice(product.earnings)}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">Total</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {data.earningsByProduct.reduce((sum, p) => sum + p.quantity, 0)} units
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {formatPrice(data.totalEarnings || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RevenueAnalytics;