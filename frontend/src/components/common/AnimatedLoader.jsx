import React from 'react';

const AnimatedLoader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center py-10';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Main Icon with Pulse Animation */}
        <img
          src="../../assets/favIcon.png"
          alt="Loading..."
          className={`${sizeClasses[size]} animate-pulse-subtle`}
        />
        
        {/* Optional: Spinning Ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-primary border-t-transparent animate-spin`} />
      </div>
    </div>
  );
};

export default AnimatedLoader;