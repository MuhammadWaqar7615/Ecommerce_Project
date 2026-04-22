import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';
import { getProductById } from '../services/product';
import { formatPrice } from '../utils/formatPrice';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    try {
      await addItem(id, quantity);
      alert('Product added to cart!');
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="h-96 bg-gray-200">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-6">
            <div className="text-sm text-primary font-semibold mb-2">{product.category}</div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            </div>

            <div className="mb-4">
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {product.averageRating > 0 && (
              <div className="flex items-center mb-4">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="ml-1 font-semibold">{product.averageRating.toFixed(1)}</span>
                <span className="ml-2 text-gray-500">({product.totalReviews} reviews)</span>
              </div>
            )}

            {product.stock > 0 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="input-field w-32"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </>
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Vendor Information</h3>
              <p className="text-gray-600">{product.shopId?.shopName || 'Unknown Vendor'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;