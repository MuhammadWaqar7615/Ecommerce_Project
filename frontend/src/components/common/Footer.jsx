import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Crafts & Delights</h3>
            <p className="text-gray-300">
              Promoting local crafts and traditional snacks from Khanewal, Pakistan.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-300 hover:text-secondary">Products</Link></li>
              <li><a href="/about" className="text-gray-300 hover:text-secondary">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-secondary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300">Email: info@craftsdelights.com</p>
            <p className="text-gray-300">Phone: +92 123 4567890</p>
            <p className="text-gray-300">Location: Khanewal, Pakistan</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Crafts & Delights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;