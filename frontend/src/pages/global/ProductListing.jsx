// src/pages/ProductListing.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import { getPublicProducts, getCategories } from '../../services/product';
import { ChevronLeft, SlidersHorizontal, X, Package, Filter } from 'lucide-react';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
  });
  console.log('Current filters:', filters);
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

  // Sync filters state whenever searchParams change
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;

    setFilters({ category, minPrice, maxPrice, search });
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    console.log('Fetching products with filters:', filters, 'and page:', currentPage);
  }, [filters, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const categoryList = data.categories || [];
      setCategories(categoryList);

      if (filters.category && !/^[0-9a-fA-F]{24}$/.test(filters.category)) {
        const matching = categoryList.find((cat) => cat.name.toLowerCase() === filters.category.toLowerCase() || cat.slug === filters.category.toLowerCase());
        if (matching) {
          setFilters((prev) => ({ ...prev, category: matching._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = {
        page: currentPage,
        limit: 12,
        q: filters.search,
        ...filters,
      };
      Object.keys(query).forEach(key => !query[key] && delete query[key]);

      const data = await getPublicProducts(query);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
    const params = new URLSearchParams();
    Object.keys({ ...filters, [name]: value }).forEach(key => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', search: '' });
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <main className="bg-gray-50/30 min-h-screen py-8 md:py-12 mt-16 md:mt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Bar: Back + Filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-8">
              <button
                onClick={() => navigate("/")}
                className="group inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm">Back to home</span>
              </button>
            </div>
          </motion.div>

          {/* Desktop Filters (inline) */}
          <div className="hidden md:flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium"
            >
              <SlidersHorizontal size={18} />
              Filters {hasActiveFilters && <span className="ml-1 text-primary">(active)</span>}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <AnimatedLoader size="lg" label="Loading products..." />
            </motion.div>
          ) : (
            <motion.div
              key="products"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {products.length === 0 ? (
                <motion.div variants={cardVariants} className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, idx) => (
                      <motion.div
                        key={product._id}
                        variants={cardVariants}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-4">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === pageNum
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
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-xl rounded-r-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={(e) => {
                      handleFilterChange(e);
                      setShowMobileFilters(false);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (PKR)</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => {
                        handleFilterChange(e);
                        setShowMobileFilters(false);
                      }}
                      className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => {
                        handleFilterChange(e);
                        setShowMobileFilters(false);
                      }}
                      className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProductListing;