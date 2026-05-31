// src/components/global/home/CategoriesSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaFolderOpen } from 'react-icons/fa';
import AnimatedLoader from '../../common/AnimatedLoader';
import { getCategories } from '../../../services/product';
import HybridCarousel from './HybridCarousel';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        const categoryList = (data.categories || []).filter((category) => (category.productCount || 0) > 0);
        setCategories(categoryList);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="section bg-gray-50/30">
        <div className="container mx-auto px-4 text-center">
          <AnimatedLoader size="md" label="Loading categories..." />
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return (
      <section className="section bg-gray-50/30">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FaFolderOpen className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Categories</h2>
            <p className="mx-auto max-w-2xl text-gray-500">Category data will appear here once products are available.</p>
            <Link to="/products" className="btn-primary mt-6 inline-flex items-center gap-2">
              Browse Products <FaChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gray-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Categories</h2>
            <p className="max-w-2xl text-gray-500">Explore products by category and discover something unique.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm font-medium">
            Available categories
          </div>
        </motion.div>

        <div>
          <HybridCarousel items={categories} type="categories" />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;