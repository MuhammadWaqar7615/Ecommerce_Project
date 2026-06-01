// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AlertConfirmation from '../../components/common/AlertConfirmation';
import { getProductById } from '../../services/product';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingBag, ChevronLeft, Minus, Plus, Star, Truck, Shield, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showAddToCartAlert, setShowAddToCartAlert] = useState(false);
  const [showBuyNowAlert, setShowBuyNowAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

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
      toast.error(error.message || 'Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      setPendingAction('cart');
      setShowLoginAlert(true);
      return;
    }
    // Show confirmation alert before adding to cart
    setShowAddToCartAlert(true);
  };

  const handleConfirmAddToCart = async () => {
    setShowAddToCartAlert(false);
    setAddingToCart(true);
    try {
      await addItem(id, quantity);
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNowClick = () => {
    if (!isAuthenticated) {
      setPendingAction('buy');
      setShowLoginAlert(true);
      return;
    }
    // Show confirmation alert before buying
    setShowBuyNowAlert(true);
  };

  const handleConfirmBuyNow = async () => {
    setShowBuyNowAlert(false);
    setBuyingNow(true);
    try {
      await addItem(id, quantity);
      navigate('/checkout');
    } catch (error) {
      toast.error(error.message);
      setBuyingNow(false);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    if (pendingAction === 'cart') {
      handleConfirmAddToCart();
    } else if (pendingAction === 'buy') {
      handleConfirmBuyNow();
    }
    setPendingAction(null);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < (product?.stock || 1)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const features = [
    { icon: Truck, title: 'Free Shipping', text: 'On orders over PKR 5,000' },
    { icon: Shield, title: 'Secure Payment', text: '100% secure transactions' },
    { icon: RefreshCw, title: 'Easy Returns', text: '30 day return policy' }
  ];

  if (loading) {
    return (
      <>
        <Header variant="public" showSearch showCart />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <AnimatedLoader size="lg" label="Loading product details..." />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header variant="public" showSearch showCart />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Product Not Found</h3>
            <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/products">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                Browse Products
              </motion.button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images?.length ? product.images : [];

  return (
    <>
      <Header variant="public" showSearch showCart />
      <main className="bg-gray-50/30 min-h-screen mt-10 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 md:mb-6 mt-2"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all group text-sm md:text-base"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-4 md:p-6">
              {/* Product Images Section */}
              <motion.div variants={itemVariants} className="space-y-3 md:space-y-4">
                <motion.div
                  variants={imageVariants}
                  className="aspect-square bg-gray-100 rounded-lg md:rounded-xl overflow-hidden border border-gray-100"
                >
                  {images[selectedImage] ? (
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="mt-2 text-sm">No image available</p>
                    </div>
                  )}
                </motion.div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          selectedImage === idx
                            ? 'border-primary shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product Info Section */}
              <motion.div variants={itemVariants} className="space-y-4 lg:col-span-2">
                {/* Category Badge */}
                <div>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {product.category?.name || product.category || 'Uncategorized'}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{product.name}</h1>

                {/* Rating */}
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{product.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({product.totalReviews || 0} reviews)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm md:text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{product.description}</p>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange('decrement')}
                          disabled={quantity <= 1}
                          className="p-1.5 px-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-gray-800">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange('increment')}
                          disabled={quantity >= product.stock}
                          className="p-1.5 px-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">Available: {product.stock} units</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {product.stock > 0 ? (
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCartClick}
                      disabled={addingToCart}
                      className="flex-1 py-2.5 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {addingToCart ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                          />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNowClick}
                      disabled={buyingNow}
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {buyingNow ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Buy Now
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}

                {/* Vendor Info */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingBag size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sold by</p>
                      <p className="text-sm font-medium text-gray-800">{product.shopId?.shopName || 'Unknown Vendor'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features Row */}
            <div className="border-t border-gray-100 bg-gray-50/30 p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-center gap-2 md:gap-3"
                    >
                      <div className="p-1.5 md:p-2 bg-white rounded-lg border border-gray-100">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-800">{feature.title}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{feature.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Add to Cart Confirmation Alert */}
      <AlertConfirmation
        isOpen={showAddToCartAlert}
        title="Add to Cart"
        message={`Are you sure you want to add ${quantity} × ${product?.name} to your cart?`}
        confirmText="Yes, Add"
        cancelText="Cancel"
        onConfirm={handleConfirmAddToCart}
        onClose={() => setShowAddToCartAlert(false)}
        type="info"
      />

      {/* Buy Now Confirmation Alert */}
      <AlertConfirmation
        isOpen={showBuyNowAlert}
        title="Buy Now"
        message={`Are you sure you want to proceed with ${quantity} × ${product?.name}? You'll be redirected to checkout.`}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        onConfirm={handleConfirmBuyNow}
        onClose={() => setShowBuyNowAlert(false)}
        type="info"
      />

      {/* Login Alert */}
      <AlertConfirmation
        isOpen={showLoginAlert}
        title="Login Required"
        message="Please login to continue with your purchase"
        confirmText="Login Now"
        cancelText="Cancel"
        onConfirm={handleLoginConfirm}
        onClose={() => {
          setShowLoginAlert(false);
          setPendingAction(null);
        }}
        type="warning"
      />
    </>
  );
};

export default ProductDetail;