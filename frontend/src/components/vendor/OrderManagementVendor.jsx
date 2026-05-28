import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import {
  ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Search, Filter, X, ChevronDown,
  Eye, Calendar, User, DollarSign
} from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import AlertConfirmation from '../common/AlertConfirmation';
import { getVendorOrders, updateOrderStatus } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusConfirmation, setStatusConfirmation] = useState({
    open: false,
    orderId: null,
    newStatus: '',
    currentStatus: ''
  });

  // Animation variants (matching CategoryManagement)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { backgroundColor: "rgba(0,0,0,0.02)", transition: { duration: 0.2 } }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getVendorOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtering & pagination
  useEffect(() => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdateRequest = (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    setStatusConfirmation({
      open: true,
      orderId,
      newStatus,
      currentStatus
    });
  };

  const confirmStatusUpdate = async () => {
    const { orderId, newStatus } = statusConfirmation;
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
      setStatusConfirmation({ open: false, orderId: null, newStatus: '', currentStatus: '' });
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      Processing: <Clock size={14} />,
      Shipped: <Truck size={14} />,
      Delivered: <CheckCircle size={14} />,
      Cancelled: <XCircle size={14} />
    };
    return icons[status] || <Package size={14} />;
  };

  const getStatusColorClass = (status) => {
    const colors = {
      Processing: 'bg-blue-100 text-blue-700',
      Shipped: 'bg-indigo-100 text-indigo-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats for summary
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statCards = [
    { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Processing', value: pendingOrders, icon: Clock, bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
    { title: 'Shipped', value: shippedOrders, icon: Truck, bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
    { title: 'Delivered', value: deliveredOrders, icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <AnimatedLoader size="lg" label="Loading orders..." />
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

      {/* Header */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
        {/* <div>
          <span className='flex gap-3 items-center'>
            <span className='p-2 bg-primary/10 rounded-xl'>
              <ShoppingBag size={24} className="text-primary" />
            </span>
            <h2 className="text-xl font-bold text-gray-800">Order Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your orders
            </p>
          </span>
        </div> */}

        <motion.div className="flex items-center gap-3 border-b border-gray-100">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShoppingBag size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Order Management
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your orders
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Status</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50/30"
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
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
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Orders Table */}
      <AnimatePresence mode="wait">
        {filteredOrders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'When customers order your products, they will appear here'}
            </p>
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <td className="p-2">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                            <User size={12} className="text-primary" />
                          </div>
                          <span className="text-sm text-gray-700">
                            {order.customerId?.fullName || 'Guest User'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm text-gray-600">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                          {order.items?.map(i => i.productId?.name).slice(0, 2).join(', ')}
                          {order.items?.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-semibold text-gray-800">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColorClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdateRequest(order._id, order.status, e.target.value)}
                            disabled={updating === order._id}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Final</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 border-t border-gray-100"
        >
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of{' '}
            <span className="font-medium">{filteredOrders.length}</span> orders
          </p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Alert Confirmation for Status Change */}
      <AlertConfirmation
        isOpen={statusConfirmation.open}
        title="Update Order Status?"
        message={`Are you sure you want to change status from "${statusConfirmation.currentStatus}" to "${statusConfirmation.newStatus}"?`}
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusConfirmation({ open: false, orderId: null, newStatus: '', currentStatus: '' })}
        type="info"
      />
    </motion.div>
  );
};

export default OrderManagement;