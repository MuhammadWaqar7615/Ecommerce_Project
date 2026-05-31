import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CallToActionSection = () => {
  return (
    <section className="section bg-gray-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-80px' }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-dark to-[#8b5e3c] px-6 py-12 text-white shadow-2xl md:px-10"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/90 backdrop-blur-sm">
                Start your marketplace journey
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-bold leading-tight">
                Ready to Become Part of Crafts & Delights?
              </h2>
              <p className="mt-4 max-w-xl text-white/85 leading-7">
                Whether you are looking to discover unique products or grow your business online, join our marketplace today.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-lg transition hover:translate-y-[-1px] hover:bg-gray-50"
              >
                Start Shopping
              </Link>
              <Link
                to="/register?role=vendor"
                className="inline-flex items-center justify-center rounded-lg border border-white/80 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;