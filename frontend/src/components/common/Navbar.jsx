import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-white">
            Crafts & Delights
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/products" className="text-white hover:text-secondary transition">
              Products
            </Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-white hover:text-secondary transition">
                  Dashboard
                </Link>
                <Link to="/cart" className="relative text-white hover:text-secondary transition">
                  <FaShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white">
                    <FaUser />
                    <span>{user.fullName?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
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

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/products" className="block text-white py-2">Products</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block text-white py-2">Dashboard</Link>
                <Link to="/cart" className="block text-white py-2">Cart ({itemCount})</Link>
                <button onClick={logout} className="block text-white py-2">Logout</button>
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