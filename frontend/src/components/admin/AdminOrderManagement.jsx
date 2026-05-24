import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, DollarSign, Package, Users } from 'lucide-react';
import { getAllOrders } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';

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

    const FilterIcon = ({ size, className }) => (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
        </svg>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Order Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingBag size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                        <p className="text-xs text-gray-500">Total Orders</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
                        <p className="text-xs text-gray-500">Total Revenue</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Package size={18} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Users size={18} className="text-teal-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{completedOrders}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
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
                                className="search-input-no-padding w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition whitespace-nowrap ${isFilterOpen || hasActiveFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <FilterIcon size={18} />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1 w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center">
                                {[searchTerm, statusFilter].filter(Boolean).length}
                            </span>
                        )}
                        <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

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
                {isFilterOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
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
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">
                        {hasActiveFilters ? 'Try adjusting your filters' : 'No orders have been placed yet'}
                    </p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="btn-primary inline-flex items-center gap-2">
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{order.orderNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{order.customerId?.fullName || 'N/A'}</p>
                                            <p className="text-xs text-gray-400">{order.customerId?.email || ''}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
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
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{formatPrice(order.totalAmount)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of{' '}
                                <span className="font-medium">{filteredOrders.length}</span> orders
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
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
                                            <button
                                                key={i}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </div>
    );
};

export default AdminOrderManagement;