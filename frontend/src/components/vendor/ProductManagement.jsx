import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Package, Image,
    ChevronLeft, ChevronRight, Grid3x3, Table2,
    Search, Filter, X, ChevronDown
} from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import AlertConfirmation from '../common/AlertConfirmation';
import { getVendorProducts, updateProduct, deleteProduct } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('productViewMode') || 'table';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [categories, setCategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, productId: null, productName: '' });
    const [visibilityConfirmation, setVisibilityConfirmation] = useState({ open: false, product: null, action: '' });

    const navigate = useNavigate();

    // Animation variants
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

    const filterVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
    };

    // Save full state before navigation
    const saveCurrentState = useCallback(() => {
        sessionStorage.setItem('productListScrollY', window.scrollY);
        sessionStorage.setItem('productListState', JSON.stringify({
            viewMode,
            currentPage,
            searchTerm,
            categoryFilter,
            statusFilter,
            stockFilter,
            sortBy,
            scrollY: window.scrollY
        }));
    }, [viewMode, currentPage, searchTerm, categoryFilter, statusFilter, stockFilter, sortBy]);

    // Restore state on mount
    useEffect(() => {
        const savedState = sessionStorage.getItem('productListState');
        const savedScrollY = sessionStorage.getItem('productListScrollY');
        if (savedState) {
            const state = JSON.parse(savedState);
            setViewMode(state.viewMode || 'table');
            setCurrentPage(state.currentPage || 1);
            setSearchTerm(state.searchTerm || '');
            setCategoryFilter(state.categoryFilter || '');
            setStatusFilter(state.statusFilter || '');
            setStockFilter(state.stockFilter || '');
            setSortBy(state.sortBy || 'newest');
            if (savedScrollY) {
                setTimeout(() => {
                    window.scrollTo({ top: parseInt(savedScrollY), behavior: 'instant' });
                }, 100);
            }
        }
        return () => {
            sessionStorage.removeItem('productListState');
            sessionStorage.removeItem('productListScrollY');
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('productViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category?.name === categoryFilter || p.category === categoryFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(p => statusFilter === 'visible' ? p.isVisible : !p.isVisible);
        }
        if (stockFilter) {
            if (stockFilter === 'low') filtered = filtered.filter(p => p.stock <= 10 && p.stock > 0);
            else if (stockFilter === 'out') filtered = filtered.filter(p => p.stock === 0);
            else if (stockFilter === 'instock') filtered = filtered.filter(p => p.stock > 10);
        }
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price_asc': return a.price - b.price;
                case 'price_desc': return b.price - a.price;
                case 'name_asc': return a.name.localeCompare(b.name);
                case 'name_desc': return b.name.localeCompare(a.name);
                case 'stock_asc': return a.stock - b.stock;
                case 'stock_desc': return b.stock - a.stock;
                default: return 0;
            }
        });
        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [products, searchTerm, categoryFilter, statusFilter, stockFilter, sortBy]);

    const fetchProducts = async () => {
        try {
            const data = await getVendorProducts();
            setProducts(data.products || []);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vendor/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setCategories(result.data.categories || []);
                const productCategories = [...new Set(products.map(p => p.category?.name || p.category).filter(Boolean))];
                setCategories(prev => [...new Set([...prev, ...productCategories])]);
            }
        } catch (error) { }
    };

    const handleEdit = (productId) => {
        saveCurrentState();
        navigate(`/vendor/products/edit/${productId}`);
    };

    const handleToggleVisibility = (product) => {
        const action = product.isVisible ? 'hide' : 'show';
        setVisibilityConfirmation({ open: true, product, action });
    };

    const confirmToggleVisibility = async () => {
        const { product, action } = visibilityConfirmation;
        try {
            await updateProduct(product._id, { isVisible: !product.isVisible });
            toast.success(`Product ${action === 'hide' ? 'hidden' : 'shown'} successfully!`);
            await fetchProducts();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setVisibilityConfirmation({ open: false, product: null, action: '' });
        }
    };

    const handleDelete = (productId, productName) => {
        setDeleteConfirmation({ open: true, productId, productName });
    };

    const confirmDelete = async () => {
        const { productId, productName } = deleteConfirmation;
        try {
            await deleteProduct(productId);
            toast.success(`"${productName}" deleted permanently!`);
            await fetchProducts();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteConfirmation({ open: false, productId: null, productName: '' });
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setStatusFilter('');
        setStockFilter('');
        setSortBy('newest');
        setIsFilterOpen(false);
        toast.info('All filters cleared');
    };

    const hasActiveFilters = searchTerm || categoryFilter || statusFilter || stockFilter || sortBy !== 'newest';

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { shortLabel: 'Out', dotColor: 'bg-red-500', textColor: 'text-red-600' };
        if (stock <= 10) return { shortLabel: 'Low', dotColor: 'bg-orange-500', textColor: 'text-orange-600' };
        return { shortLabel: 'In', dotColor: 'bg-green-500', textColor: 'text-green-600' };
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <AnimatedLoader size="lg" label="Loading products..." />
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
            <motion.div variants={cardVariants} className="flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Package size={24} className="text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Products Managment
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage your Products
                    </p>
                </div>
            </motion.div>

            {/* Search and Filters Bar */}
            <motion.div variants={cardVariants}>
                <div className="flex flex-col md:flex-row gap-4 p-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by product name or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition whitespace-nowrap ${isFilterOpen || hasActiveFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && <span className="ml-1 w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center">{[searchTerm, categoryFilter, statusFilter, stockFilter].filter(Boolean).length}</span>}
                        <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown size={16} /></motion.div>
                    </motion.button>
                    
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                        <option value="stock_asc">Stock: Low to High</option>
                        <option value="stock_desc">Stock: High to Low</option>
                    </select>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div variants={filterVariants} initial="hidden" animate="visible" exit="exit" className="mt-4 pt-4 border-t border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                                        <option value="">All Categories</option>
                                        {categories.map((cat, idx) => <option key={idx} value={typeof cat === 'string' ? cat : cat.name}>{typeof cat === 'string' ? cat : cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Visibility</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                                        <option value="">All Status</option>
                                        <option value="visible">Visible</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
                                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                                        <option value="">All Stock</option>
                                        <option value="instock">In Stock (&gt;10)</option>
                                        <option value="low">Low Stock (≤10)</option>
                                        <option value="out">Out of Stock (0)</option>
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button onClick={clearFilters} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">Clear All</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Products Display with smooth crossfade */}
            <AnimatePresence mode="wait">
                {filteredProducts.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-center py-16">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"><Package size={40} className="text-gray-400" /></div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">{hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first product'}</p>
                        {hasActiveFilters ? (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearFilters} className="btn-primary inline-flex items-center gap-2">Clear Filters</motion.button>
                        ) : (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/vendor/products/add')} className="btn-primary inline-flex items-center gap-2"><Plus size={18} /> Add Product</motion.button>
                        )}
                    </motion.div>
                ) : viewMode === 'table' ? (
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentProducts.map((product, index) => {
                                        const stockStatus = getStockStatus(product.stock);
                                        return (
                                            <motion.tr
                                                key={product._id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover="hover"
                                                transition={{ delay: index * 0.03 }}
                                                className="group"
                                            >
                                                <td className="px-4 sm:px-6 py-4">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><Image size={20} className="text-gray-400" /></div>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="max-w-[200px]">
                                                        <p className="font-medium text-gray-800 mb-1 truncate">{product.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{product.description || 'No description'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                                                        {product.category?.name || product.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(product.price)}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 ${stockStatus.dotColor} rounded-full`}></span>
                                                        <span className={`text-sm ${stockStatus.textColor} font-medium`}>
                                                            {stockStatus.shortLabel} ({product.stock})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    {product.isVisible ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Visible
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Hidden
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(product._id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit size={18} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggleVisibility(product)} className={`p-2 rounded-lg transition-all ${product.isVisible ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-500 hover:bg-green-50'}`} title={product.isVisible ? 'Hide' : 'Show'}>{product.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}</motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(product._id, product.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentProducts.map((product, index) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <motion.div
                                            key={product._id}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{ y: -4 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative bg-white rounded-xl overflow-hidden cursor-pointer"
                                        >
                                            {/* Image Container */}
                                            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={48} className="text-gray-400" />
                                                    </div>
                                                )}

                                                {/* Stock Badge (top-left) */}
                                                {product.stock === 0 && (
                                                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-gray-800/80 backdrop-blur-sm text-white text-[11px] font-medium rounded-md shadow-sm">
                                                        Out of Stock
                                                    </span>
                                                )}
                                                {product.stock > 0 && product.stock <= 10 && (
                                                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-orange-500/90 backdrop-blur-sm text-white text-[11px] font-medium rounded-md shadow-sm">
                                                        Only {product.stock} left
                                                    </span>
                                                )}

                                                {/* Action Icons (bottom-right, appear on hover) */}
                                                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                                    <button
                                                        onClick={() => handleEdit(product._id)}
                                                        className="p-1.5 bg-white rounded-lg shadow-md text-blue-600 hover:bg-blue-50 transition"
                                                        title="Edit product"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleVisibility(product)}
                                                        className={`p-1.5 bg-white rounded-lg shadow-md transition ${product.isVisible ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                                        title={product.isVisible ? 'Hide product' : 'Show product'}
                                                    >
                                                        {product.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id, product.name)}
                                                        className="p-1.5 bg-white rounded-lg shadow-md text-red-600 hover:bg-red-50 transition"
                                                        title="Delete product permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Minimal left-aligned content */}
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-primary truncate">{product.name}</h3>
                                                <div className="flex items-center gap-1 mt-1 min-w-0">
                                                    <span className="text-primary">
                                                        {formatPrice(product.price)}
                                                    </span>

                                                    <span className={`${stockStatus.textColor} flex items-center pl-1 gap-1 min-w-0 truncate`}>
                                                        <span className={`w-1.5 h-1.5 ${stockStatus.dotColor} rounded-full flex-shrink-0`}></span>
                                                        <span className="truncate">
                                                            {stockStatus.shortLabel} ({product.stock})
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> products</p>
                    <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><ChevronLeft size={18} /></motion.button>
                        <div className="flex gap-1">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;
                                return (
                                    <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => goToPage(pageNum)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>{pageNum}</motion.button>
                                );
                            })}
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><ChevronRight size={18} /></motion.button>
                    </div>
                </motion.div>
            )}

            {/* Alert Confirmation Modals */}
            <AlertConfirmation
                isOpen={deleteConfirmation.open}
                title="Delete Product?"
                message={`Are you sure you want to permanently delete "${deleteConfirmation.productName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmation({ open: false, productId: null, productName: '' })}
                type="danger"
            />
            <AlertConfirmation
                isOpen={visibilityConfirmation.open}
                title={visibilityConfirmation.action === 'hide' ? 'Hide Product?' : 'Show Product?'}
                message={`Are you sure you want to ${visibilityConfirmation.action} "${visibilityConfirmation.product?.name}"? ${visibilityConfirmation.action === 'hide' ? 'Hidden products will not be visible to customers.' : 'Shown products will be visible to customers.'}`}
                confirmText={visibilityConfirmation.action === 'hide' ? 'Hide' : 'Show'}
                cancelText="Cancel"
                onConfirm={confirmToggleVisibility}
                onCancel={() => setVisibilityConfirmation({ open: false, product: null, action: '' })}
                type={visibilityConfirmation.action === 'hide' ? 'warning' : 'info'}
            />
        </motion.div>
    );
};

export default ProductManagement;