// src/components/global/home/CategoriesSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import AnimatedLoader from '../../common/AnimatedLoader';
// import { getPopularCategories } from '../../../services/category';
import { getPopularCategories } from '../../../services/getPopularCat';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getPopularCategories(4);
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50/30">
        <div className="container mx-auto px-4 text-center">
          <AnimatedLoader size="md" label="Loading categories..." />
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-12 bg-gray-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Categories</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Discover what others are loving right now</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id || idx}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <Link to={`/products?category=${cat.name}`} className="block p-6">
                <div className={`w-14 h-14 ${cat.bgColor || 'bg-gray-100'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  {cat.icon ? (
                    <span className="text-2xl">{cat.icon}</span>
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{cat.description || 'Shop now'}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Shop now <FaArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;