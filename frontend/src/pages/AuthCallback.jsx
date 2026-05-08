import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    // Only process once to avoid infinite loops
    if (processedRef.current) return;
    processedRef.current = true;

    try {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      if (!token || !userParam) {
        console.error('Missing token or user data');
        setTimeout(() => navigate('/login', { replace: true }), 100);
        return;
      }

      const user = JSON.parse(decodeURIComponent(userParam));

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on user role
      const redirectPath = user.role === 'admin' ? '/admin' : 
                          user.role === 'vendor' ? '/vendor' : 
                          '/';
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error processing auth callback:', error);
      setTimeout(() => navigate('/login', { replace: true }), 100);
    }
  }, []); // Empty dependency array - only runs once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-extrabold text-gray-900">Processing authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we complete your login.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
