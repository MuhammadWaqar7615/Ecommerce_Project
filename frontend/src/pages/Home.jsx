// Home.jsx (updated section)
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import AnimatedLoader from '../components/common/AnimatedLoader';
import HomeHeader from '../components/common/HomeHeader';
import Footer from '../components/common/Footer';
import { getProducts } from '../services/product';
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaStar, FaArrowRight, FaLeaf, FaHands } from 'react-icons/fa';
import HeroSlider from '../components/common/HeroSlider';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredData, newData] = await Promise.all([
          getProducts({ page: 1, limit: 8 }),
          getProducts({ page: 1, limit: 4, sort: '-createdAt' })
        ]);
        setFeaturedProducts(featuredData.products);
        setNewArrivals(newData.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Food', icon: FaLeaf, description: 'Traditional snacks & delicacies', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50' },
    { name: 'Crafts', icon: FaHands, description: 'Handmade crafts & decor', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
    { name: 'Sandals', icon: '👡', description: 'Traditional leather sandals', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
    { name: 'Home Decor', icon: '🏠', description: 'Beautiful home accessories', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
  ];

  const features = [
    { icon: FaTruck, title: 'Free Shipping', description: 'On orders over PKR 5000', color: 'text-blue-600' },
    { icon: FaShieldAlt, title: 'Secure Payment', description: '100% secure transactions', color: 'text-green-600' },
    { icon: FaUndo, title: 'Easy Returns', description: '30 day return policy', color: 'text-orange-600' },
    { icon: FaHeadset, title: '24/7 Support', description: 'Dedicated customer support', color: 'text-purple-600' },
  ];

  return (
    <>
      <HomeHeader />
      
      <main>
        {/* Hero Section */}
        <HeroSlider />

        {/* Features Section - Sticky Scroll Effect */}
        <motion.section 
          style={{ opacity }}
          className="py-20 bg-white relative z-20"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <Icon className={`text-2xl ${feature.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Categories Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover authentic products from local artisans</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    className={`${category.bgColor} rounded-2xl p-8 text-center cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-xl`}
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {typeof Icon === 'string' ? Icon : <Icon />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <Link 
                      to={`/products?category=${category.name}`}
                      className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group-hover:gap-3 transition-all"
                    >
                      Shop Now <FaArrowRight className="text-sm" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Featured Products</h2>
                <p className="text-lg text-gray-600">Handpicked just for you</p>
              </div>
              <Link to="/products" className="group hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                View All <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            {loading ? (
              <AnimatedLoader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Stay Updated</h2>
                <p className="text-gray-600">Get exclusive offers, new product launches, and artisan stories directly in your inbox</p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Subscribe Now
                </button>
              </form>
              
              <p className="text-center text-sm text-gray-500 mt-6">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;