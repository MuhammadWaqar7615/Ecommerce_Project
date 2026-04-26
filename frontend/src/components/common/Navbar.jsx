import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show Products button for admin
  const showProductsButton = user?.role !== 'admin';

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Get role display name
  const getRoleDisplay = (role) => {
    if (!role) return '';
    switch(role) {
      case 'admin':
        return 'Admin';
      case 'vendor':
        return 'Vendor';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-white">
            Crafts & Delights
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {/* Only show Products button if not admin */}
            {showProductsButton && (
              <Link to="/products" className="text-white hover:text-secondary transition">
                Products
              </Link>
            )}
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-white hover:text-secondary transition">
                  Dashboard
                </Link>
                {user.role === 'customer' && (
                  <Link to="/cart" className="relative text-white hover:text-secondary transition">
                    <FaShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Updated Dropdown - Click to open */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-white hover:text-secondary transition focus:outline-none"
                  >
                    <FaUser size={18} />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.fullName?.split(' ')[0]}</span>
                      <span className="text-xs opacity-80">{getRoleDisplay(user.role)}</span>
                    </div>
                  </button>
                  
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop for closing when clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      
                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-primary">{user.fullName}</p>
                          <p className="text-xs text-primary/70 mt-1">{user.email}</p>
                          <p className="text-xs text-primary/70 mt-1">
                            Role: <span className="font-medium">{getRoleDisplay(user.role)}</span>
                          </p>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-primary/5 transition flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-secondary transition">
                  Login
                </Link>
                <Link to="/register" className="bg-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {/* Only show Products button if not admin */}
            {showProductsButton && (
              <Link to="/products" className="block text-white py-2">Products</Link>
            )}
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block text-white py-2">Dashboard</Link>
                {user.role === 'customer' && (
                  <Link to="/cart" className="block text-white py-2">Cart ({itemCount})</Link>
                )}
                <button onClick={handleLogout} className="block text-white py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white py-2">Login</Link>
                <Link to="/register" className="block text-white py-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;