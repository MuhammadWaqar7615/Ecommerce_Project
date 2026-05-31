// src/components/global/home/FeaturedProductsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBoxOpen } from 'react-icons/fa';
import ProductCard from '../../common/ProductCard';
import AnimatedLoader from '../../common/AnimatedLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FeaturedProductsSection = ({
  products = [],
  loading,
  title = 'Featured Products',
  subtitle = 'Discover some of the most popular handmade crafts and specialty products available on our marketplace.',
  actionLabel = 'View All Products',
  actionTo = '/products',
}) => {
  if (loading) {
    return (
      <section className="section bg-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedLoader size="lg" label="Loading products..." />
        </div>
      </section>
    );
  }

  const hasProducts = products.length > 0;

  return (
    <section className="section bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-col sm:flex-row justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="max-w-2xl text-gray-500">{subtitle}</p>
          </div>
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all mt-2 sm:mt-0"
          >
            {actionLabel} <FaArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {hasProducts ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.05 } } }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FaBoxOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">No featured products available right now.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Browse the full marketplace to discover the latest crafts and specialty products from our vendors.
            </p>
            <Link to="/products" className="btn-primary mt-6 inline-flex items-center gap-2">
              Browse Products <FaArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;