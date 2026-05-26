import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { Edit, Trash2, Plus, Search, X, ChevronDown, ChevronLeft, ChevronRight, Package, TrendingUp } from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../../services/admin';
import 'react-toastify/dist/ReactToastify.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [creating, setCreating] = useState(false);

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

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        hover: { backgroundColor: "rgba(0,0,0,0.02)", transition: { duration: 0.2 } }
    };

    const statCardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, type: "spring", stiffness: 300 } },
        hover: { scale: 1.02, transition: { duration: 0.2 } }
    };

    const filterVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
    };

    // Save scroll position
    const saveScrollPosition = useCallback(() => {
        sessionStorage.setItem('categoryListScrollY', window.scrollY);
        sessionStorage.setItem('categoryListState', JSON.stringify({
            currentPage,
            searchTerm,
            sortBy,
            scrollY: window.scrollY
        }));
    }, [currentPage, searchTerm, sortBy]);

    // Restore scroll position
    useEffect(() => {
        const savedState = sessionStorage.getItem('categoryListState');
        const savedScrollY = sessionStorage.getItem('categoryListScrollY');

        if (savedState) {
            const state = JSON.parse(savedState);
            setCurrentPage(state.currentPage || 1);
            setSearchTerm(state.searchTerm || '');
            setSortBy(state.sortBy || 'newest');

            if (savedScrollY) {
                setTimeout(() => {
                    window.scrollTo({ top: parseInt(savedScrollY), behavior: 'instant' });
                }, 100);
            }
        }

        return () => {
            sessionStorage.removeItem('categoryListState');
            sessionStorage.removeItem('categoryListScrollY');
        };
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...categories];

        if (searchTerm) {
            filtered = filtered.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        setFilteredCategories(filtered);
        setCurrentPage(1);
    }, [categories, searchTerm, sortBy]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) {
            toast.warning('Please enter a category name');
            return;
        }
        setCreating(true);
        try {
            await addCategory({ name: newCategory.trim() });
            setNewCategory('');
            await fetchCategories();
            toast.success(`Category "${newCategory.trim()}" created successfully!`);
        } catch (error) {
            toast.error(error.message || 'Failed to create category');
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (id, newName) => {
        if (!newName.trim()) {
            toast.warning('Category name cannot be empty');
            return;
        }
        try {
            await updateCategory(id, { name: newName.trim() });
            setEditingId(null);
            setEditName('');
            await fetchCategories();
            toast.success(`Category updated to "${newName.trim()}"`);
        } catch (error) {
            toast.error(error.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id, name) => {
        toast.info(
            {
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
            }
        );
        
        try {
            await deleteCategory(id);
            await fetchCategories();
            toast.success(`Category "${name}" deleted successfully!`);
        } catch (error) {
            toast.error(error.message || 'Failed to delete category');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSortBy('newest');
        setIsFilterOpen(false);
        toast.info('All filters cleared');
    };

    const hasActiveFilters = searchTerm || sortBy !== 'newest';

    const totalCategories = categories.length;
    const recentCategories = categories.filter(cat => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(cat.createdAt) > weekAgo;
    }).length;

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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
        return <AnimatedLoader size="lg" label="Loading categories..." />;
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

            {/* Header with Add Category */}
            <motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Category Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name..."
                        className="w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creating || !newCategory.trim()}
                        className="btn-primary flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                    >
                        {creating ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : (
                            <Plus size={16} />
                        )}
                        Add Category
                    </motion.button>
                </div>
            </motion.div>

            {/* Statistics Row */}
            <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-gray-100 bg-gray-50/30"
            >
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Package size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {totalCategories}
                        </motion.p>
                        <p className="text-xs text-gray-500">Total Categories</p>
                    </div>
                </motion.div>
                
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp size={18} className="text-green-600" />
                    </div>
                    <div>
                        <motion.p 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            {recentCategories}
                        </motion.p>
                        <p className="text-xs text-gray-500">Added This Week</p>
                    </div>
                </motion.div>
                
                <motion.div variants={statCardVariants} whileHover="hover" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package size={18} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">—</p>
                        <p className="text-xs text-gray-500">Used by Products</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={cardVariants} className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search categories..."
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
                                {[searchTerm].filter(Boolean).length}
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
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
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
            </motion.div>

            {/* Categories Table */}
            <AnimatePresence mode="wait">
                {filteredCategories.length === 0 ? (
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
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first category to get started'}
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence>
                                        {currentCategories.map((cat, index) => (
                                            <motion.tr
                                                key={cat._id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover="hover"
                                                transition={{ delay: index * 0.03 }}
                                                className="group"
                                            >
                                                <td className="px-6 py-4">
                                                    {editingId === cat._id ? (
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                                            autoFocus
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleEdit(cat._id, editName);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(cat.createdAt).toLocaleDateString('en-PK', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {editingId === cat._id ? (
                                                            <>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleEdit(cat._id, editName)}
                                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                                                                >
                                                                    Save
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        setEditName('');
                                                                    }}
                                                                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                                                                >
                                                                    Cancel
                                                                </motion.button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => {
                                                                        setEditingId(cat._id);
                                                                        setEditName(cat.name);
                                                                    }}
                                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                                    title="Edit Category"
                                                                >
                                                                    <Edit size={18} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleDelete(cat._id, cat.name)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                                    title="Delete Category"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </motion.button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
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
                                    <span className="font-medium">{Math.min(indexOfLastItem, filteredCategories.length)}</span> of{' '}
                                    <span className="font-medium">{filteredCategories.length}</span> categories
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

export default CategoryManagement;