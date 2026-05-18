import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import AnimatedLoader from '../components/common/AnimatedLoader';
import HomeHeader from '../components/common/HomeHeader';
import Footer from '../components/common/Footer';
import { getProducts } from '../services/product';
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaStar, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { name: 'Food', icon: '🍽️', description: 'Traditional snacks & delicacies', color: 'bg-orange-100', textColor: 'text-orange-600' },
    { name: 'Crafts', icon: '🎨', description: 'Handmade crafts & decor', color: 'bg-purple-100', textColor: 'text-purple-600' },
    { name: 'Sandals', icon: '👡', description: 'Traditional leather sandals', color: 'bg-blue-100', textColor: 'text-blue-600' },
    { name: 'Home Decor', icon: '🏠', description: 'Beautiful home accessories', color: 'bg-green-100', textColor: 'text-green-600' },
  ];

  const features = [
    { icon: FaTruck, title: 'Free Shipping', description: 'On orders over PKR 5000' },
    { icon: FaShieldAlt, title: 'Secure Payment', description: '100% secure transactions' },
    { icon: FaUndo, title: 'Easy Returns', description: '30 day return policy' },
    { icon: FaHeadset, title: '24/7 Support', description: 'Dedicated customer support' },
  ];

  return (
    <>
      <HomeHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary to-dark text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                Discover the Soul of Khanewal
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Explore authentic handmade crafts and delicious traditional snacks, 
                directly from local artisans and food makers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                  Shop Now
                </Link>
                <Link to="/products?category=Crafts" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                  Explore Crafts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="text-primary text-xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
                <p className="text-gray-500 mt-1">Handpicked just for you</p>
              </div>
              <Link to="/products" className="text-primary hover:underline flex items-center gap-1">
                View All <FaArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <AnimatedLoader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="section bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="newsletter-card">
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Stay Updated</h2>
                <p className="text-gray-600 mt-1">Get new product launches, deals & stories — no spam.</p>
              </div>

              <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="newsletter-input"
                />
                <button className="newsletter-cta">Subscribe</button>
              </form>
            </div>

            <p className="mt-3 text-center small-muted">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;