// HeroSlider.jsx - Debugged Version
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img1 from '../../../assets/clothes-1.webp';
import img2 from '../../../assets/delights-1.webp';
import img3 from '../../../assets/shoes-1.webp';
import img4 from '../../../assets/home-decors-1.webp';
import { useNavigate } from 'react-router-dom';

const slides = [
  { id: 1, image: img1, title: "Traditional Attire", subtitle: "Embrace Cultural Elegance" },
  { id: 2, image: img2, title: "Artisanal Delights", subtitle: "Handcrafted with Love" },
  { id: 3, image: img3, title: "Heritage Footwear", subtitle: "Walk in Tradition" },
  { id: 4, image: img4, title: "Home Decor", subtitle: "Transform Your Space" }
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const navigate = useNavigate();

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        opacity: { duration: 0.6, ease: "easeOut" },
        scale: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
        opacity: { duration: 0.4, ease: "easeIn" },
        scale: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
      }
    })
  };

  const nextSlide = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 800);
  };

  const goToSlide = (clickedIndex) => {
    console.log('Clicked index:', clickedIndex); // Debug log
    console.log('Current index:', currentIndex); // Debug log

    if (isAnimatingRef.current) {
      console.log('Animation in progress, ignoring click');
      return;
    }

    if (clickedIndex === currentIndex) {
      console.log('Already on this slide, ignoring click');
      return;
    }

    isAnimatingRef.current = true;
    // Set direction based on clicked index
    const newDirection = clickedIndex > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(clickedIndex);
    console.log('Changing to slide:', clickedIndex);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 800);
  };

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Removed currentIndex dependency to prevent timer restart

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-[5] pointer-events-none" />

      {/* Slider Images */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slides[currentIndex].image})`,
              transform: 'translateZ(0)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Static Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {slides[currentIndex].title}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {slides[currentIndex].subtitle}
            </motion.p>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button onClick={() => navigate('/products')} className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:scale-105 transition-transform duration-300">
                Shop Now
              </button>
              <button
                onClick={() => {
                  const collectionSection = document.getElementById('collection');
                  if (collectionSection) {
                    collectionSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Explore Collections
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Circular Dots Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className="group relative focus:outline-none cursor-pointer"
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
          >
            <div className={`
              rounded-full transition-all duration-300 ease-out
              ${idx === currentIndex
                ? 'w-3 h-3 bg-white scale-100'
                : 'w-2 h-2 bg-white/40 group-hover:bg-white/70 group-hover:scale-110'
              }
            `} />

            <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
              {slide.title}
            </span>
          </button>
        ))}

      </div>
    </div>
  );
};

export default HeroSlider;