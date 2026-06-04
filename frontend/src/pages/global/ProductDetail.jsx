// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AnimatedLoader from '../../components/common/AnimatedLoader';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AlertConfirmation from '../../components/common/AlertConfirmation';
import { getProductById } from '../../services/product';
import { formatPrice } from '../../utils/formatPrice';
import {
  ShoppingBag, ChevronLeft, Minus, Plus,
  Truck, Shield, RefreshCw, CreditCard, X,
  ZoomIn, ZoomOut, ChevronRight, ChevronLeft as ChevronLeftIcon,
  Grid3X3
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
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
  const [showRoleRestrictionAlert, setShowRoleRestrictionAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

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

  // Helper to extract shop ID from product (handles populated object or plain ID)
  const getProductShopId = (product) => {
    if (!product) return null;
    if (product.shopId && typeof product.shopId === 'object' && product.shopId._id) {
      return product.shopId._id;
    }
    return product.shopId;
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
    // Not authenticated or user object missing → login alert
    if (!isAuthenticated || !user) {
      setPendingAction('cart');
      setShowLoginAlert(true);
      return;
    }
    if (user.role !== 'customer') {
      setShowRoleRestrictionAlert(true);
      return;
    }
    setShowAddToCartAlert(true);
  };

  const handleConfirmAddToCart = async () => {
    setShowAddToCartAlert(false);
    setAddingToCart(true);
    try {
      const shopId = getProductShopId(product);
      await addItem(id, quantity, shopId);
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNowClick = () => {
    if (!isAuthenticated || !user) {
      setPendingAction('buy');
      setShowLoginAlert(true);
      return;
    }
    if (user.role !== 'customer') {
      setShowRoleRestrictionAlert(true);
      return;
    }
    setShowBuyNowAlert(true);
  };

  const handleConfirmBuyNow = async () => {
    setShowBuyNowAlert(false);
    setBuyingNow(true);
    try {
      const shopId = getProductShopId(product);
      await addItem(id, quantity, shopId);
      navigate('/checkout');
    } catch (error) {
      toast.error(error.message);
      setBuyingNow(false);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    navigate('/login', { state: { from: `/products/${id}`, pendingAction } });
    setPendingAction(null);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < (product?.stock || 1)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
    setZoomLevel(1);
  };

  const nextImage = () => {
    if (lightboxIndex < (product?.images?.length || 0) - 1) {
      setLightboxIndex(lightboxIndex + 1);
      setZoomLevel(1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
      setZoomLevel(1);
    }
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setShowLightbox(false);
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, lightboxIndex]);

  if (loading) {
    return (
      <>
        <Header variant="public" showSearch showCart />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <AnimatedLoader size="lg" label="Loading product..." />
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
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-2">Not Found</h2>
            <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-primary text-white rounded-lg">
              Browse Collection
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images?.length ? product.images : [];
  const mainImage = images[selectedImage] || null;
  const thumbnails = [];
  for (let i = 1; i <= 6; i++) {
    thumbnails.push(images[i] || null);
  }

  const features = [
    { icon: Truck, title: 'Free Shipping', text: 'On orders over PKR 5,000' },
    { icon: Shield, title: 'Secure Payment', text: '100% secure transactions' },
    { icon: RefreshCw, title: 'Easy Returns', text: '30 day return policy' }
  ];

  return (
    <>
      <Header variant="public" showSearch showCart />
      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back to Collection</span>
            </button>
          </div>

          {/* Hero Images Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-12">
            <div className="lg:col-span-3 aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                  onClick={() => openLightbox(selectedImage)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingBag size={48} strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
              {thumbnails.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    if (img) {
                      setSelectedImage(idx + 1);
                      openLightbox(idx + 1);
                    }
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 2}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <ShoppingBag size={24} strokeWidth={1} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="relative lg:col-span-5 -mt-8 lg:-mt-12 flex justify-end">
              <button
                onClick={() => setShowGalleryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-sm font-medium text-gray-800 hover:bg-white transition-all"
              >
                <Grid3X3 size={16} />
                View all photos
              </button>
            </div>
          </div>

          {/* Two Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <span className="inline-block text-xs font-medium text-primary uppercase tracking-wider">
                  {product.category?.name || product.category || 'Essentials'}
                </span>
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 mt-2 leading-tight">
                  {product.name}
                </h1>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3 pt-2">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{feature.title}</p>
                        <p className="text-xs text-gray-500">{feature.text}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Crafted by</p>
                    <p className="font-medium text-gray-800">{product.shopId?.shopName || 'Artisan Vendor'}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <span className="text-3xl font-semibold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </motion.div>

              {product.stock > 0 && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange('decrement')}
                        disabled={quantity <= 1}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center text-gray-800">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange('increment')}
                        disabled={quantity >= product.stock}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">{product.stock} units available</span>
                  </div>
                </motion.div>
              )}

              {product.stock > 0 ? (
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleAddToCartClick}
                    disabled={addingToCart}
                    className="flex-1 py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary/5 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNowClick}
                    disabled={buyingNow}
                    className="flex-1 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {buyingNow ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Buy Now
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-gray-500">This item is currently out of stock.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 overflow-y-auto"
            onClick={() => setShowGalleryModal(false)}
          >
            <div className="min-h-screen p-6" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="fixed top-4 right-4 z-10 text-white hover:text-gray-300 transition"
              >
                <X size={32} />
              </button>
              <div className="max-w-6xl mx-auto mt-12">
                <h2 className="text-white text-xl font-light mb-6 text-center">All Photos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => {
                        setShowGalleryModal(false);
                        openLightbox(idx);
                      }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setShowLightbox(false)}
          >
            <div className="absolute top-4 right-4 flex gap-3 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLightbox(false); }}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
              >
                <X size={20} />
              </button>
            </div>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-10"
              >
                <ChevronLeftIcon size={28} />
              </button>
            )}

            {lightboxIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-10"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <div
              className="w-full h-full flex items-center justify-center p-12"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
            >
              <img
                src={images[lightboxIndex]}
                alt={`${product.name} ${lightboxIndex + 1}`}
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                className="max-w-full max-h-full object-contain cursor-zoom-in"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts */}
      <AlertConfirmation
        isOpen={showAddToCartAlert}
        title="Add to Cart"
        message={`Add ${quantity} × ${product?.name} to your cart?`}
        confirmText="Yes, Add"
        cancelText="Cancel"
        onConfirm={handleConfirmAddToCart}
        onClose={() => setShowAddToCartAlert(false)}
        type="info"
      />
      <AlertConfirmation
        isOpen={showBuyNowAlert}
        title="Buy Now"
        message={`Proceed with ${quantity} × ${product?.name}? You'll be redirected to checkout.`}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        onConfirm={handleConfirmBuyNow}
        onClose={() => setShowBuyNowAlert(false)}
        type="info"
      />
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
      <AlertConfirmation
        isOpen={showRoleRestrictionAlert}
        title="Access Restricted"
        message="Only customers can purchase products. Please login with a customer account."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowRoleRestrictionAlert(false)}
        onClose={() => setShowRoleRestrictionAlert(false)}
        type="warning"
      />
    </>
  );
};

export default ProductDetail;