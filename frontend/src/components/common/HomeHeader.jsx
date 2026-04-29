import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaUser, FaShoppingCart, FaChevronDown, FaSearch } from 'react-icons/fa';

const HomeHeader = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'vendor': return '/vendor/dashboard';
            default: return '/customer/dashboard';
        }
    };

    const getRoleDisplay = (role) => {
        if (!role) return '';
        switch (role) {
            case 'admin': return 'Admin';
            case 'vendor': return 'Vendor';
            case 'customer': return 'Customer';
            default: return role;
        }
    };

    const getDisplayName = () => {
        if (!user) return 'Guest';
        return user?.fullName?.split(' ')[0] || 'User';
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-primary shadow-lg z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    {/* Logo */}
                    <Link to="/" className="text-xl md:text-2xl font-bold text-white">
                        Crafts & Delights
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors md:hidden"
                        >
                            <FaSearch size={16} />
                        </button>

                        {/* Desktop Search */}
                        <div className="hidden md:block">
                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                            <FaShoppingCart size={18} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                    <FaUser size={12} className="text-white" />
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium">{getDisplayName()}</p>
                                    {user && <p className="text-xs opacity-80">{getRoleDisplay(user?.role)}</p>}
                                </div>
                                <FaChevronDown size={10} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                    {user ? (
                                        <>
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                                                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Role: <span className="font-medium text-primary">{getRoleDisplay(user?.role)}</span>
                                                </p>
                                            </div>
                                            <Link
                                                to={getDashboardLink()}
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="md:hidden pb-3">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <FaSearch className="text-gray-400" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
};

export default HomeHeader;