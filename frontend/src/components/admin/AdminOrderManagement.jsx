import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, DollarSign, Package, Users, Eye, Calendar } from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import { getAllOrders } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import 'react-toastify/dist/ReactToastify.css';

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);

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

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        hover: { backgroundColor: "rgba(0,0,0,0.02)", transition: { duration: 0.2 } }
    };

    const filterVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
    };

    const accordionVariants = {
        collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
        expanded: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    // Save scroll position
    const saveScrollPosition = useCallback(() => {
        sessionStorage.setItem('orderListScrollY', window.scrollY);
        sessionStorage.setItem('orderListState', JSON.stringify({
            currentPage,
            searchTerm,
            statusFilter,
            sortBy,
            scrollY: window.scrollY
        }));
    }, [currentPage, searchTerm, statusFilter, sortBy]);

    // Restore scroll position
    useEffect(() => {
        const savedState = sessionStorage.getItem('orderListState');
        const savedScrollY = sessionStorage.getItem('orderListScrollY');

        if (savedState) {
            const state = JSON.parse(savedState);
            setCurrentPage(state.currentPage || 1);
            setSearchTerm(state.searchTerm || '');
            setStatusFilter(state.statusFilter || '');
            setSortBy(state.sortBy || 'newest');

            if (savedScrollY) {
                setTimeout(() => {
                    window.scrollTo({ top: parseInt(savedScrollY), behavior: 'instant' });
                }, 100);
            }
        }

        return () => {
            sessionStorage.removeItem('orderListState');
            sessionStorage.removeItem('orderListScrollY');
        };
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...orders];

        // Search filter (by order number or customer name)
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount_asc':
                    return a.totalAmount - b.totalAmount;
                case 'amount_desc':
                    return b.totalAmount - a.totalAmount;
                default:
                    return 0;
            }
        });

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [orders, searchTerm, statusFilter, sortBy]);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setSortBy('newest');
        setIsFilterOpen(false);
        toast.info('All filters cleared');
    };

    const hasActiveFilters = searchTerm || statusFilter || sortBy !== 'newest';

    // Statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Pending': return <Package size={12} />;
            case 'Processing': return <Package size={12} />;
            case 'Shipped': return <Package size={12} />;
            case 'Delivered': return <Package size={12} />;
            case 'Cancelled': return <Package size={12} />;
            default: return <Package size={12} />;
        }
    };

    const FilterIcon = ({ size, className }) => (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
        </svg>
    );

    if (loading) {
        return <AnimatedLoader size="lg" label="Loading orders..." />;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-2xl shadow-sm"
        >
            <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                hideProgressBar={false} 
                newestOnTop 
                closeOnClick 
                rtl={false} 
                pauseOnFocusLoss 
                draggable 
                pauseOnHover 
                theme="light" 
            />

            {/* Header */}
            <motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Order Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
            </motion.div>

            {/* Statistics Row */}
            <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50/30"
            >
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingBag size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {totalOrders}
                        </motion.p>
                        <p className="text-xs text-gray-500">Total Orders</p>
                    </div>
                </motion.div>
                
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign size={18} className="text-green-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {formatPrice(totalRevenue)}
                        </motion.p>
                        <p className="text-xs text-gray-500">Total Revenue</p>
                    </div>
                </motion.div>
                
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Package size={18} className="text-yellow-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {pendingOrders}
                        </motion.p>
                        <p className="text-xs text-gray-500">Pending</p>
                    </div>
                </motion.div>
                
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Users size={18} className="text-teal-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.3 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {completedOrders}
                        </motion.p>
                        <p className="text-xs text-gray-500">Completed</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Search and Filters Bar */}
            <motion.div variants={cardVariants} className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by order number or customer name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            />
                            {searchTerm && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Filter Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition whitespace-nowrap ${isFilterOpen || hasActiveFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <FilterIcon size={18} />
                        Filters
                        {hasActiveFilters && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-1 w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center"
                            >
                                {[searchTerm, statusFilter].filter(Boolean).length}
                            </motion.span>
                        )}
                        <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                            <ChevronDown size={16} />
                        </motion.div>
                    </motion.button>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_asc">Amount: Low to High</option>
                        <option value="amount_desc">Amount: High to Low</option>
                    </select>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            variants={filterVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Order Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>

                                {/* Filter Actions */}
                                <div className="flex items-end gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={clearFilters}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                    >
                                        Clear All Filters
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'No orders have been placed yet'}
                        </p>
                        {hasActiveFilters && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearFilters}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                Clear Filters
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence>
                                        {currentOrders.map((order, index) => (
                                            <React.Fragment key={order._id}>
                                                <motion.tr
                                                    variants={tableRowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    whileHover="hover"
                                                    transition={{ delay: index * 0.02 }}
                                                    className="group cursor-pointer"
                                                    onClick={() => toggleOrderDetails(order._id)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800 text-sm">{order.orderNumber}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm text-gray-600">{order.customerId?.fullName || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400">{order.customerId?.email || ''}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-0.5">
                                                            {order.items.slice(0, 2).map((item, idx) => (
                                                                <p key={idx} className="text-sm text-gray-600">
                                                                    {item.quantity}x {item.productId?.name || 'Product'}
                                                                </p>
                                                            ))}
                                                            {order.items.length > 2 && (
                                                                <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                                                            )}
                                                        </div>
                                                     </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-gray-800">{formatPrice(order.totalAmount)}</p>
                                                     </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                            {order.status}
                                                        </span>
                                                     </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                     </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleOrderDetails(order._id);
                                                                }}
                                                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </motion.button>
                                                        </div>
                                                     </td>
                                                </motion.tr>

                                                {/* Expanded Row - Order Details */}
                                                <AnimatePresence>
                                                    {expandedOrder === order._id && (
                                                        <motion.tr
                                                            variants={accordionVariants}
                                                            initial="collapsed"
                                                            animate="expanded"
                                                            exit="collapsed"
                                                        >
                                                            <td colSpan="7" className="px-4 py-4 bg-gradient-to-r from-gray-50 to-white">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* Order Items */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                                            <Package size={14} className="text-primary" />
                                                                            Order Items
                                                                        </h4>
                                                                        <div className="space-y-2">
                                                                            {order.items.map((item, idx) => (
                                                                                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100">
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-800">{item.productId?.name || 'Product'}</p>
                                                                                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                                                                    </div>
                                                                                    <p className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="mt-3 pt-2 border-t border-gray-200">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm font-semibold text-gray-700">Total</span>
                                                                                <span className="text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Shipping & Payment Info */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                                            <Users size={14} className="text-primary" />
                                                                            Customer Information
                                                                        </h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <p><span className="text-gray-500">Customer:</span> <span className="font-medium">{order.customerId?.fullName || 'N/A'}</span></p>
                                                                            <p><span className="text-gray-500">Email:</span> <span className="font-medium">{order.customerId?.email || 'N/A'}</span></p>
                                                                            <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{order.customerId?.phone || 'N/A'}</span></p>
                                                                        </div>
                                                                        
                                                                        {order.shippingAddress && (
                                                                            <>
                                                                                <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-2 flex items-center gap-2">
                                                                                    <Package size={14} className="text-primary" />
                                                                                    Shipping Address
                                                                                </h4>
                                                                                <div className="space-y-1 text-sm">
                                                                                    <p className="text-gray-600">{order.shippingAddress.street}</p>
                                                                                    <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                                                                                    <p className="text-gray-600">Postal Code: {order.shippingAddress.postalCode || 'N/A'}</p>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100"
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
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === pageNum
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
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminOrderManagement;