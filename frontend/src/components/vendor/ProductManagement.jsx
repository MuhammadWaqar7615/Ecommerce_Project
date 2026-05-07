import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Plus, Edit, Trash2, Eye, EyeOff, Package, Image, 
    ChevronLeft, ChevronRight, Grid3x3, Table2, 
    Search, Filter, X, ChevronDown, LayoutGrid, List,
    Star
} from 'lucide-react';
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
    const [showFilters, setShowFilters] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Save scroll position before navigating away
    const saveScrollPosition = useCallback(() => {
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

    // Restore scroll position when coming back
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
        
        // Clear saved state after restoring
        return () => {
            sessionStorage.removeItem('productListState');
            sessionStorage.removeItem('productListScrollY');
        };
    }, []);

    // Save view mode to localStorage
    useEffect(() => {
        localStorage.setItem('productViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(product =>
                product.category?.name === categoryFilter || product.category === categoryFilter
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(product =>
                statusFilter === 'visible' ? product.isVisible : !product.isVisible
            );
        }

        // Stock filter
        if (stockFilter) {
            if (stockFilter === 'low') {
                filtered = filtered.filter(product => product.stock <= 10 && product.stock > 0);
            } else if (stockFilter === 'out') {
                filtered = filtered.filter(product => product.stock === 0);
            } else if (stockFilter === 'instock') {
                filtered = filtered.filter(product => product.stock > 10);
            }
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'stock_asc':
                    return a.stock - b.stock;
                case 'stock_desc':
                    return b.stock - a.stock;
                default:
                    return 0;
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
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/vendor/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setCategories(result.data.categories || []);
                // Extract unique categories from products as well
                const productCategories = [...new Set(products.map(p => p.category?.name || p.category).filter(Boolean))];
                setCategories(prev => [...new Set([...prev, ...productCategories])]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleEdit = (productId) => {
        saveScrollPosition();
        navigate(`/vendor/products/edit/${productId}`);
    };

    const handleToggleVisibility = async (product) => {
        const action = product.isVisible ? 'hide' : 'show';
        if (confirm(`Are you sure you want to ${action} "${product.name}"?`)) {
            try {
                await updateProduct(product._id, { isVisible: !product.isVisible });
                toast.success(`Product ${action}n successfully!`);
                await fetchProducts();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleDelete = async (productId, productName) => {
        if (confirm(`⚠️ Permanently delete "${productName}"?\n\nThis action cannot be undone!`)) {
            try {
                await deleteProduct(productId);
                toast.success('Product deleted permanently!');
                await fetchProducts();
            } catch (error) {
                toast.error(error.message);
            }
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

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'red', icon: '🔴' };
        if (stock <= 10) return { label: 'Low Stock', color: 'orange', icon: '🟠' };
        return { label: '', color: 'green', icon: '🟢' };
    };

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
                    <h2 className="text-xl font-bold text-gray-800">My Products</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                            title="Table View"
                        >
                            <Table2 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                            title="Grid View"
                        >
                            <Grid3x3 size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/vendor/products/add')}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${isFilterOpen || hasActiveFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1 w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center">
                                {[searchTerm, categoryFilter, statusFilter, stockFilter].filter(Boolean).length}
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
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                        <option value="stock_asc">Stock: Low to High</option>
                        <option value="stock_desc">Stock: High to Low</option>
                    </select>
                </div>

                {/* Expanded Filters */}
                {isFilterOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={typeof cat === 'string' ? cat : cat.name}>
                                            {typeof cat === 'string' ? cat : cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Visibility</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="visible">Visible</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">All Stock</option>
                                    <option value="instock">In Stock (&gt;10)</option>
                                    <option value="low">Low Stock (≤10)</option>
                                    <option value="out">Out of Stock (0)</option>
                                </select>
                            </div>

                            {/* Filter Actions */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">
                        {hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first product'}
                    </p>
                    {hasActiveFilters ? (
                        <button onClick={clearFilters} className="btn-primary inline-flex items-center gap-2">
                            Clear Filters
                        </button>
                    ) : (
                        <button onClick={() => navigate('/vendor/products/add')} className="btn-primary inline-flex items-center gap-2">
                            <Plus size={18} />
                            Add Product
                        </button>
                    )}
                </div>
            ) : viewMode === 'table' ? (
                // Table View
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentProducts.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                return (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                    <Image size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800 mb-1">{product.name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{product.description || 'No description'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {product.category?.name || product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-800">{formatPrice(product.price)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-${stockStatus.color}-600 font-medium`}>
                                                <span className={`w-2 h-2 bg-${stockStatus.color}-500 rounded-full`}></span>
                                                {stockStatus.label} ({product.stock})
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isVisible ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    Visible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                    Hidden
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEdit(product._id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleToggleVisibility(product)} className={`p-2 rounded-lg transition-all ${product.isVisible ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-500 hover:bg-green-50'}`} title={product.isVisible ? 'Hide' : 'Show'}>
                                                    {product.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button onClick={() => handleDelete(product._id, product.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Grid View
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock);
                            return (
                                <div key={product._id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    {/* Image Container */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={48} className="text-gray-400" />
                                            </div>
                                        )}
                                        {product.isVisible ? (
                                            <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                                                <Eye size={12} /> Visible
                                            </span>
                                        ) : (
                                            <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                                                <EyeOff size={12} /> Hidden
                                            </span>
                                        )}
                                        {product.stock <= 10 && product.stock > 0 && (
                                            <span className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Low Stock</span>
                                        )}
                                        {product.stock === 0 && (
                                            <span className="absolute top-2 left-2 px-2 py-1 bg-gray-500 text-white text-xs rounded-full">Out of Stock</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="mb-2">
                                            <span className="text-xs text-gray-500">{product.category?.name || product.category || 'Uncategorized'}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description || 'No description'}</p>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                                            <span className={`text-sm ${stockStatus.color === 'green' ? 'text-green-600' : stockStatus.color === 'orange' ? 'text-orange-600' : 'text-red-600'}`}>
                                                {stockStatus.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Stock:</span>
                                                <span className={`font-medium ${product.stock <= 10 ? 'text-orange-600' : 'text-gray-700'}`}>{product.stock} units</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(product._id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleToggleVisibility(product)} className={`p-1.5 rounded-lg transition ${product.isVisible ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-500 hover:bg-green-50'}`} title={product.isVisible ? 'Hide' : 'Show'}>
                                                    {product.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button onClick={() => handleDelete(product._id, product.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of{' '}
                        <span className="font-medium">{filteredProducts.length}</span> products
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === pageNum
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
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </div>
    );
};

export default ProductManagement;