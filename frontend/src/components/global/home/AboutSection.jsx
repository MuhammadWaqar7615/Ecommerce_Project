import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaShieldAlt, FaStore, FaUsers } from 'react-icons/fa';
import aboutImage from '../../../assets/hero-img.webp';

const highlights = [
  {
    icon: FaShieldAlt,
    title: 'Secure Shopping',
    description: 'Protected account, checkout, and order flows for every customer.',
  },
  {
    icon: FaStore,
    title: 'Vendor Empowerment',
    description: 'Tools that help artisans and sellers manage shops and products with ease.',
  },
  {
    icon: FaUsers,
    title: 'Marketplace Management',
    description: 'A coordinated platform experience for customers, vendors, and administrators.',
  },
];

const AboutSection = () => {
  return (
    <section className="section bg-gray-50/30">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              About Crafts & Delights
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              A multi-vendor marketplace built for local artisans, trusted sellers, and thoughtful shopping.
            </h2>
            <p className="mt-4 max-w-2xl text-gray-600 leading-7">
              Crafts & Delights connects customers with handmade crafts, specialty products, and local vendors through a secure and well-managed marketplace experience.
              It is designed to make discovery simple, empower vendors to grow online, and give administrators the tools to maintain a high-quality platform.
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 leading-6">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-primary">
                <FaChartLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Designed for sustainable marketplace growth</p>
                <p className="text-xs text-gray-500">Built to support discovery, trust, and vendor success.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-secondary/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 bg-white p-3 sm:p-4 shadow-xl">
              <img
                src={aboutImage}
                alt="Crafts & Delights marketplace"
                className="h-[250px] sm:h-[350px] md:h-[420px] lg:h-[500px] w-full rounded-[1rem] sm:rounded-[1.5rem] object-cover"
              />

              {/* Bottom left overlay – now truly compact with right gap */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 w-64 sm:w-auto sm:max-w-[260px] md:max-w-xs rounded-xl sm:rounded-2xl bg-white/95 p-3 backdrop-blur-sm shadow-lg">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">Marketplace visibility</p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed break-words">
                  Give customers confidence while giving vendors a polished storefront presence.
                </p>
              </div>

              {/* Top right overlay – unchanged */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 md:right-6 md:top-6 rounded-xl sm:rounded-2xl bg-primary px-3 py-2 sm:px-4 sm:py-3 text-white shadow-lg">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/70">Trusted platform</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold">Secure</p>
                <p className="text-[11px] sm:text-sm text-white/90">shopping for all users</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;