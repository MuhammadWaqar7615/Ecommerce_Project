// src/components/global/home/FeaturesSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset } from 'react-icons/fa';

const features = [
  { icon: FaTruck, title: 'Free Shipping', description: 'On orders over PKR 5,000', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: FaShieldAlt, title: 'Secure Payment', description: '100% secure transactions', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
  { icon: FaUndo, title: 'Easy Returns', description: '30 day return policy', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: FaHeadset, title: '24/7 Support', description: 'Dedicated customer support', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`p-3 ${feature.bgColor} rounded-xl shrink-0`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;