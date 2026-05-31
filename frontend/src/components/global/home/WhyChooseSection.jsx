import React from 'react';
import { motion } from 'framer-motion';
import { FaHandsHelping, FaShieldAlt, FaStar, FaStore, FaTruck, FaUsers } from 'react-icons/fa';
import HybridCarousel from './HybridCarousel';

const values = [
  {
    icon: FaHandsHelping,
    title: 'Support Local Vendors',
    description: 'Help local artisans and businesses grow online.',
  },
  {
    icon: FaStore,
    title: 'Multi-Vendor Marketplace',
    description: 'Discover products from multiple trusted sellers in one place.',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure Shopping',
    description: 'Safe authentication, checkout, and order management.',
  },
  {
    icon: FaStar,
    title: 'Quality Products',
    description: 'Browse carefully managed handmade and specialty products.',
  },
  {
    icon: FaTruck,
    title: 'Easy Order Tracking',
    description: 'Stay informed about every stage of your order.',
  },
  {
    icon: FaUsers,
    title: 'Community Driven Platform',
    description: 'Connecting customers, vendors, and local businesses together.',
  },
];

const WhyChooseSection = () => {
  return (
    <section className="section bg-gray-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Why Choose Crafts & Delights
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Trust-building value propositions designed for a modern marketplace experience.
          </h2>
        </motion.div>

        <div className="mt-10">
          <HybridCarousel items={values} type="why-choose" />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;