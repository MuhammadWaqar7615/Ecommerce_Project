import React, { useLayoutEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const MainLayout = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div style={{ '--header-height': `${headerHeight}px` }}>
      <Header variant="public" showSearch showCart ref={headerRef} />
      <main style={{ paddingTop: 'var(--header-height)' }} className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
