import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaTag } from 'react-icons/fa';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const WhyChooseCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="group h-full rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-white group-hover:text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
          Trust
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-white">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-500 transition-colors duration-300 group-hover:text-white/85">
        {item.description}
      </p>
    </div>
  );
};

const CategoryCard = ({ item }) => {
  const initial = item.name?.charAt(0)?.toUpperCase() || 'C';

  return (
    <Link
      to={`/products?category=${encodeURIComponent(item.slug || item.name)}`}
      className="group block h-full rounded-[18px] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/20 text-primary transition-colors duration-300 group-hover:bg-white group-hover:text-primary">
          <span className="text-lg font-bold">{initial}</span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
          <FaTag className="h-3 w-3" />
          {item.productCount || 0}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-white">
        {item.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-500 transition-colors duration-300 group-hover:text-white/85">
        Browse products in this category.
      </p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300 group-hover:gap-3 group-hover:text-white">
        View products <FaChevronRight className="h-3 w-3" />
      </span>
    </Link>
  );
};

const TimelineCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <div className="group h-full rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-white group-hover:text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
          Step {index + 1}
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-white">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-500 transition-colors duration-300 group-hover:text-white/85">
        {item.description}
      </p>
    </div>
  );
};

const HybridCarousel = ({
  items = [],
  type,
  breakpoint = 1024,
  autoScrollSpeed = 0.6,
  cardWidth = 325,
  cardGap = 23,
  className = '',
  renderItem,
}) => {
  const frameRef = useRef(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(autoScrollSpeed);
  const draggingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const dragStartedRef = useRef(false);
  const clickSuppressedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const cycleWidth = items.length * (cardWidth + cardGap);
  const repeatedItems = useMemo(() => Array.from({ length: 4 }, () => items).flat(), [items]);

  // Use a ref to track position for transform
  const transformPositionRef = useRef(0);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!cycleWidth) return;

    let animationId;
    
    const step = () => {
      if (!draggingRef.current) {
        // Gradual deceleration to auto speed
        if (Math.abs(velocityRef.current) > autoScrollSpeed) {
          velocityRef.current = velocityRef.current * 0.98;
        } else if (Math.abs(velocityRef.current) < autoScrollSpeed && velocityRef.current !== autoScrollSpeed) {
          velocityRef.current = autoScrollSpeed;
        }
        
        positionRef.current = (positionRef.current + velocityRef.current);
        
        // Keep position within bounds for infinite loop
        if (positionRef.current >= cycleWidth) {
          positionRef.current -= cycleWidth;
        } else if (positionRef.current < 0) {
          positionRef.current += cycleWidth;
        }
        
        transformPositionRef.current = positionRef.current;
        forceUpdate({}); // Trigger re-render
      }
      
      animationId = requestAnimationFrame(step);
    };
    
    animationId = requestAnimationFrame(step);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [cycleWidth, autoScrollSpeed]); // Only recreate when these change

  useEffect(() => {
    const onPointerMove = (event) => {
      if (!pointerActiveRef.current) return;

      const currentTime = performance.now();
      const deltaX = event.clientX - lastXRef.current;
      const elapsed = Math.max(currentTime - lastTimeRef.current, 16);
      const totalDistanceX = event.clientX - startXRef.current;
      const totalDistanceY = event.clientY - startYRef.current;

      if (!dragStartedRef.current) {
        if (Math.abs(totalDistanceX) < 4 && Math.abs(totalDistanceY) < 4) {
          return;
        }
        dragStartedRef.current = true;
        draggingRef.current = true;
      }

      positionRef.current -= deltaX;
      
      // Keep position within bounds
      if (positionRef.current >= cycleWidth) {
        positionRef.current -= cycleWidth;
      } else if (positionRef.current < 0) {
        positionRef.current += cycleWidth;
      }

      // Calculate velocity with smoothing
      const rawVelocity = (deltaX / elapsed) * 16;
      const newVelocity = clamp(rawVelocity, -14, 14);
      velocityRef.current = newVelocity;

      lastXRef.current = event.clientX;
      lastTimeRef.current = currentTime;
      transformPositionRef.current = positionRef.current;
      forceUpdate({});
    };

    const onPointerUp = () => {
      if (!pointerActiveRef.current) return;

      pointerActiveRef.current = false;
      draggingRef.current = false;
      
      // Clear drag start flag immediately
      setTimeout(() => {
        dragStartedRef.current = false;
      }, 0);

      if (dragStartedRef.current) {
        clickSuppressedRef.current = true;
        setTimeout(() => {
          clickSuppressedRef.current = false;
        }, 100);
      }
      dragStartedRef.current = false;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [cycleWidth]);

  const handlePointerDown = (event) => {
    if (!items.length) return;
    
    pointerActiveRef.current = true;
    draggingRef.current = false;
    dragStartedRef.current = false;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    lastXRef.current = event.clientX;
    lastTimeRef.current = performance.now();
  };

  const handleClickCapture = (event) => {
    if (clickSuppressedRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (!items.length) {
    return null;
  }

  const currentTransform = transformPositionRef.current;

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm"
          onClick={() => {
            positionRef.current = (positionRef.current + (cardWidth + cardGap)) % cycleWidth;
            transformPositionRef.current = positionRef.current;
            forceUpdate({});
          }}
          aria-label="Scroll left"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm"
          onClick={() => {
            positionRef.current = (positionRef.current - (cardWidth + cardGap)) % cycleWidth;
            if (positionRef.current < 0) positionRef.current += cycleWidth;
            transformPositionRef.current = positionRef.current;
            forceUpdate({});
          }}
          aria-label="Scroll right"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        className={`overflow-hidden ${draggingRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        role="region"
        aria-label={type === 'categories' ? 'Categories carousel' : 'Why choose carousel'}
      >
        <div
          className="flex will-change-transform"
          style={{
            gap: `${cardGap}px`,
            transform: `translate3d(-${currentTransform}px, 0, 0)`,
          }}
        >
          {repeatedItems.map((item, index) => {
            const key = `${item._id || item.title || item.name}-${index}`;

            return (
              <div key={key} className="shrink-0" style={{ width: `${cardWidth}px` }}>
                {renderItem
                  ? renderItem(item, index)
                  : type === 'categories'
                    ? <CategoryCard item={item} />
                    : type === 'timeline'
                      ? <TimelineCard item={item} index={index % items.length} />
                      : <WhyChooseCard item={item} />}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400 md:hidden">Swipe or drag to explore more items.</p>
    </div>
  );
};

export default HybridCarousel;