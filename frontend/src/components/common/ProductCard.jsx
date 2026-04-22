import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="card block">
      <div className="relative h-48 bg-gray-200">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm text-primary font-semibold mb-1">{product.category}</div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          {product.averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="text-sm ml-1">{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;