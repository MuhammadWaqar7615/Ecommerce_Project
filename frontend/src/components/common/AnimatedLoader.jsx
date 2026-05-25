import React from 'react';

const AnimatedLoader = ({ size = 'md', fullScreen = false, label = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-10';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Loading"
            className={`${sizeClasses[size]} animate-pulse-subtle relative z-10 object-contain`}
          />

          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-primary/25 border-t-primary animate-spin`} />
        </div>

        {label ? (
          <p className="text-sm font-medium text-primary tracking-wide">{label}</p>
        ) : null}
      </div>
    </div>
  );
};

export default AnimatedLoader;