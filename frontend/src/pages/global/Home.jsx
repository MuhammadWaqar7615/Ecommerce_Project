// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HeroSlider from '../../components/global/home/HeroSlider'
import AnimatedLoader from '../../components/common/AnimatedLoader';
import FeaturesSection from '../../components/global/home/FeaturesSection';
import CategoriesSection from '../../components/global/home/CategoriesSection';
import FeaturedProductsSection from '../../components/global/home/FeaturedProductsSection';
import NewsletterSection from '../../components/global/home/NewsletterSection';
import { getProducts } from '../../services/product';

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
        setFeaturedProducts(featuredData.products || []);
        setNewArrivals(newData.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <>
        <Header variant="public" showSearch showCart />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <AnimatedLoader size="lg" label="Loading homepage..." />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header variant="public" showSearch showCart />
      <main>
        <HeroSlider />
        <FeaturesSection />
        <CategoriesSection />
        <FeaturedProductsSection products={featuredProducts} loading={false} />
        <FeaturedProductsSection 
          products={newArrivals} 
          loading={false} 
          title="New Arrivals" 
          subtitle="Fresh from our artisans"
        />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;