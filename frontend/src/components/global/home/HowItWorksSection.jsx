import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHeadset, FaSearch, FaShoppingCart, FaStore } from 'react-icons/fa';
import HybridCarousel from './HybridCarousel';

const steps = [
  {
    icon: FaSearch,
    title: 'Explore Products',
    description: 'Browse handmade crafts and specialty products from trusted vendors.',
  },
  {
    icon: FaShoppingCart,
    title: 'Place an Order',
    description: 'Add products to your cart and complete checkout securely.',
  },
  {
    icon: FaStore,
    title: 'Vendors Fulfill Orders',
    description: 'Vendors receive, prepare, and process orders from their stores.',
  },
  {
    icon: FaCheckCircle,
    title: 'Track & Receive',
    description: 'Customers stay updated throughout the order journey.',
  },
  {
    icon: FaHeadset,
    title: 'Review & Support',
    description: 'Leave reviews, ratings, and receive support when needed.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="section bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            How Crafts & Delights Works
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Connecting customers with local artisans and vendors through a simple and secure marketplace experience.
          </h2>
        </motion.div>

        <div className="mt-12">
          <HybridCarousel
            items={steps}
            type="timeline"
            cardWidth={320}
            cardGap={23}
            className="pb-3"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;