import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBars, FaChevronDown, FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const getRoleDisplay = (role) => {
  if (!role) return '';
  switch (role) {
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

const getDashboardLink = (role) => {
  if (!role) return '/login';
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    default:
      return '/customer/dashboard';
  }
};

const getDisplayName = (user) => user?.fullName?.split(' ')[0] || 'User';

const Header = ({
  variant = 'dashboard',
  onMenuClick,
  headerRef,
  position = 'fixed',
  showSearch = false,
  showProductsLink = false,
  showCart = false,
  cartVisibility = 'always',
  showMobileMenu = false,
  logoutRedirectTo = null,
}) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isDashboard = variant === 'dashboard';

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
    setIsMenuOpen(false);
    if (logoutRedirectTo) {
      navigate(logoutRedirectTo);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const shouldShowCart = showCart && (cartVisibility === 'always' || user?.role === 'customer');
  const shouldShowProductsLink = showProductsLink && (!user || (user.role !== 'admin' && user.role !== 'vendor'));
  const headerPositionClass = isDashboard
    ? 'fixed top-0 left-0 right-0'
    : `${position === 'sticky' ? 'sticky' : 'fixed'} top-0 left-0 right-0`;

    // for dashboard variants
  if (isDashboard) {
    return (
      <header ref={headerRef} className={`${headerPositionClass} bg-primary shadow-lg z-50`}>
        <div className="flex items-center justify-between px-4 md:px-6 py-1">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <FaBars size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white">
                <img src="/logo.svg" alt="Logo" width={48} height={48} />
                Crafts & Delights
              </Link>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FaUser size={14} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{getDisplayName(user)}</p>
                <p className="text-xs opacity-80">{getRoleDisplay(user?.role)}</p>
              </div>
              <FaChevronDown
                size={12}
                className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium text-primary">{getRoleDisplay(user?.role)}</span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // For global pages
  return (
    <header className={`${headerPositionClass} bg-primary shadow-lg z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white">
            <img src="/logo.svg" alt="Logo" width={48} height={48} />
            Crafts & Delights
          </Link>

          <div className="flex items-center gap-3">
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors md:hidden"
              >
                {isSearchOpen ? <FaTimes size={16} /> : <FaSearch size={16} />}
              </button>
            )}

            {showSearch && (
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-56 text-white ring-2 ring-gray-300 lg:w-64 px-4 py-1.5 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-secondary"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <FaSearch
                      size={14}
                      className="text-gray-400 cursor-pointer group-focus-within:text-white"
                    />
                  </button>
                </form>
              </div>
            )}

            {shouldShowCart && (
              <Link to="/cart" className="relative ml-2 p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                <FaShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <FaUser size={12} className="text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">{getDisplayName(user)}</p>
                  {user && <p className="text-xs opacity-80">{getRoleDisplay(user?.role)}</p>}
                </div>
                <FaChevronDown
                  size={10}
                  className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-primary">{getRoleDisplay(user?.role)}</span>
                        </p>
                      </div>
                      <Link
                        to={getDashboardLink(user?.role)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {showMobileMenu && (
              <button
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            )}
          </div>
        </div>

        {showSearch && isSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </button>
            </form>
          </div>
        )}

        {showMobileMenu && isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {shouldShowProductsLink && (
              <Link to="/products" className="block text-white py-2" onClick={() => setIsMenuOpen(false)}>
                Products
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to={getDashboardLink(user?.role)}
                  className="block text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {shouldShowCart && (
                  <Link to="/cart" className="block text-white py-2" onClick={() => setIsMenuOpen(false)}>
                    Cart ({itemCount})
                  </Link>
                )}
                <button onClick={handleLogout} className="block text-white py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white py-2" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block text-white py-2" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;