import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBars, FaChevronDown } from 'react-icons/fa';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const getRoleDisplay = (role) => {
    if (!role) return '';
    switch(role) {
      case 'admin': return 'Admin';
      case 'vendor': return 'Vendor';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-primary shadow-lg z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-1">
        {/* Left section - Menu button and logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <FaBars size={18} />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Crafts & Delights</h1>
            <p className="text-xs text-white/80 hidden sm:block">
              Welcome, {user?.fullName?.split(' ')[0] || 'User'}
            </p>
          </div>
        </div>

        {/* Right section - User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FaUser size={14} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.fullName?.split(' ')[0] || 'User'}</p>
              <p className="text-xs opacity-80">{getRoleDisplay(user?.role)}</p>
            </div>
            <FaChevronDown size={12} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Role: <span className="font-medium text-primary">{getRoleDisplay(user?.role)}</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;