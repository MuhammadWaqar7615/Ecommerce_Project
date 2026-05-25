import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getOrders } from '../../services/order';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { 
    ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, 
    Eye, Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight, 
    TrendingUp, DollarSign, MapPin, Calendar, CreditCard, Box
} from 'lucide-react';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let filtered = [...orders];

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
        }

        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Pending': return <Clock size={16} className="text-yellow-500" />;
            case 'Processing': return <Package size={16} className="text-blue-500" />;
            case 'Shipped': return <Truck size={16} className="text-purple-500" />;
            case 'Delivered': return <CheckCircle size={16} className="text-green-500" />;
            case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return <Package size={16} className="text-gray-500" />;
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setIsFilterOpen(false);
        toast.info('All filters cleared');
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all';

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const FilterIcon = ({ size, className }) => (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
        </svg>
    );

    // Animation variants
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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const statCardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, type: "spring", stiffness: 300 } },
        hover: { scale: 1.02, transition: { duration: 0.2 } }
    };

    const accordionVariants = {
        collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
        expanded: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const filterVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
    };

    const pageTransitionVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
    };

    if (loading) {
        return (
            <DashboardLayout title="My Orders" subtitle="View all your orders">
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
        <DashboardLayout title="My Orders" subtitle="View all your orders">
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
                                    {totalOrders}
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
                                <p className="text-sm text-gray-500">Delivered</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="text-2xl font-bold text-green-600"
                                >
                                    {deliveredOrders}
                                </motion.p>
                            </div>
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-500" />
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
                                <p className="text-sm text-gray-500">In Progress</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="text-2xl font-bold text-yellow-600"
                                >
                                    {pendingOrders}
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
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="text-2xl font-bold text-primary"
                                >
                                    {formatPrice(totalSpent)}
                                </motion.p>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <DollarSign size={20} className="text-primary" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Search and Filters Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-xl border border-gray-100 mb-6"
                >
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by order number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition whitespace-nowrap text-sm ${isFilterOpen || hasActiveFilters
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <FilterIcon size={16} />
                                Filters
                                {hasActiveFilters && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-1 w-4 h-4 bg-white text-primary rounded-full text-xs flex items-center justify-center"
                                    >
                                        {[searchTerm, statusFilter !== 'all'].filter(Boolean).length}
                                    </motion.span>
                                )}
                                <motion.div
                                    animate={{ rotate: isFilterOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown size={14} />
                                </motion.div>
                            </motion.button>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    variants={filterVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="mt-4 pt-4 border-t border-gray-200"
                                >
                                    <div className="flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={clearFilters}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                        >
                                            Clear All Filters
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Orders List */}
                <AnimatePresence mode="wait">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl border border-gray-100 p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
                            <p className="text-gray-500 mb-6">
                                {hasActiveFilters ? 'Try adjusting your filters' : 'You haven\'t placed any orders yet'}
                            </p>
                            {hasActiveFilters ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={clearFilters}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    Clear Filters
                                </motion.button>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                                        Start Shopping
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="space-y-4"
                        >
                            {currentOrders.map((order, index) => (
                                <motion.div
                                    key={order._id}
                                    variants={cardVariants}
                                    layout
                                    transition={{ layout: { duration: 0.3 } }}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    {/* Accordion Header */}
                                    <motion.div 
                                        className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleAccordion(order._id)}
                                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                    >
                                        <div className="flex flex-wrap justify-between items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-800">Order #{order.orderNumber}</p>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Box size={12} />
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown size={18} className="text-gray-400" />
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    {/* Accordion Body */}
                                    <AnimatePresence>
                                        {expandedOrder === order._id && (
                                            <motion.div
                                                variants={accordionVariants}
                                                initial="collapsed"
                                                animate="expanded"
                                                exit="collapsed"
                                                className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-gray-100">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                                        <Package size={16} className="text-primary" />
                                                        Order Items
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <motion.div 
                                                                key={idx}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-800">{item.productId?.name || 'Product'}</p>
                                                                    <div className="flex flex-wrap gap-3 mt-1">
                                                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                                        <p className="text-xs text-gray-400">Price: {formatPrice(item.price)}</p>
                                                                        <p className="text-xs text-gray-400">Vendor: {item.shopId?.shopName || 'Unknown'}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border-b border-gray-100">
                                                    {order.shippingAddress && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="bg-white rounded-lg p-4 border border-gray-100"
                                                        >
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <MapPin size={16} className="text-primary" />
                                                                Shipping Address
                                                            </h4>
                                                            <div className="space-y-1 text-sm text-gray-600">
                                                                <p>{order.shippingAddress?.street}</p>
                                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
                                                                <p>Postal Code: {order.shippingAddress?.postalCode || 'N/A'}</p>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <motion.div 
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="bg-white rounded-lg p-4 border border-gray-100"
                                                    >
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                            <CreditCard size={16} className="text-primary" />
                                                            Payment Summary
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Subtotal</span>
                                                                <span className="text-gray-700">{formatPrice(order.totalAmount - order.shippingFee)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Shipping Fee</span>
                                                                <span className="text-gray-700">{formatPrice(order.shippingFee)}</span>
                                                            </div>
                                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                                <div className="flex justify-between font-bold">
                                                                    <span className="text-gray-800">Total Paid</span>
                                                                    <span className="text-primary text-lg">{formatPrice(order.totalAmount)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-400 pt-1">
                                                                <span>Payment Status</span>
                                                                <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <div className="p-5">
                                                    {order.status === 'Shipped' && order.trackingNumber && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Truck size={20} className="text-blue-600 mt-0.5" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-blue-800">Order Shipped</p>
                                                                    <p className="text-sm text-blue-700 mt-1">Tracking Number: <span className="font-mono">{order.trackingNumber}</span></p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {order.status === 'Delivered' && order.deliveredAt && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="bg-green-50 rounded-lg p-4 mb-4 border border-green-100"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-green-800">Order Delivered</p>
                                                                    <p className="text-sm text-green-700 mt-1">Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-PK', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <div className="flex justify-end gap-3 pt-2">
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Link
                                                                to={`/customer/orders/${order._id}`}
                                                                className="flex items-center gap-2 px-5 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium"
                                                            >
                                                                <Eye size={16} />
                                                                View Full Details
                                                            </Link>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100"
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
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={18} />
                            </motion.button>
                            <div className="flex gap-1">
                                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => goToPage(pageNum)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum
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
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </DashboardLayout>
    );
};

export default CustomerOrders;