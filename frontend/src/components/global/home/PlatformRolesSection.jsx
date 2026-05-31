import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaStore, FaUser } from 'react-icons/fa';

const roles = [
  {
    icon: FaUser,
    title: 'Customer',
    description: 'Browse products, manage your cart, place orders, track purchases, and leave reviews.',
    features: ['Product discovery', 'Shopping cart', 'Secure checkout', 'Order tracking', 'Reviews & ratings'],
  },
  {
    icon: FaStore,
    title: 'Vendor',
    description: 'Manage your shop, products, inventory, and customer orders through a dedicated vendor dashboard.',
    features: ['Shop management', 'Product management', 'Inventory control', 'Order fulfillment', 'Revenue insights'],
  },
  {
    icon: FaShieldAlt,
    title: 'Admin',
    description: 'Monitor platform activity, manage users, approve vendors, and maintain marketplace quality.',
    features: ['Vendor approval', 'Product moderation', 'User management', 'Dispute resolution', 'Platform analytics'],
  },
];

const PlatformRolesSection = () => {
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
            Built for Every Member of the Marketplace
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Crafts & Delights provides dedicated tools and experiences for customers, vendors, and administrators.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                viewport={{ once: true, margin: '-80px' }}
                className="flex h-full flex-col rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-gray-800">{role.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{role.description}</p>

                <ul className="mt-6 space-y-3 flex-1">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformRolesSection;