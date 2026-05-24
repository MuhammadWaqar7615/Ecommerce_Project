import React, { useLayoutEffect, useRef, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(56);
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return undefined;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerElement.getBoundingClientRect().height);
    };

    updateHeaderHeight();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateHeaderHeight)
      : null;

    if (resizeObserver) {
      resizeObserver.observe(headerElement);
    }

    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 overflow-x-hidden"
      style={{ '--dashboard-header-height': `${headerHeight}px` }}
    >
      <Header
        variant="dashboard"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        headerRef={headerRef}
        logoutRedirectTo="/login"
      />
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
        style={{ paddingTop: 'var(--dashboard-header-height)' }}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;