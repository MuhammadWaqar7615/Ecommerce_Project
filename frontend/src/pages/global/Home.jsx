// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HeroSlider from '../../components/global/home/HeroSlider'
import FeaturedProductsSection from '../../components/global/home/FeaturedProductsSection';
import AboutSection from '../../components/global/home/AboutSection';
import HowItWorksSection from '../../components/global/home/HowItWorksSection';
import WhyChooseSection from '../../components/global/home/WhyChooseSection';
import PlatformRolesSection from '../../components/global/home/PlatformRolesSection';
import CallToActionSection from '../../components/global/home/CallToActionSection';
import CategoriesSection from '../../components/global/home/CategoriesSection';
import { getPublicProducts } from '../../services/product';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredData = await getPublicProducts({ page: 1, limit: 8 });
        setFeaturedProducts(featuredData.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Header variant="public" showSearch showCart />
      <main>
        <HeroSlider />
        <FeaturedProductsSection products={featuredProducts} loading={loading} />
        <AboutSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <PlatformRolesSection />
        <CallToActionSection />
        <CategoriesSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;