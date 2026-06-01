const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  addReview,
  getShopLocationById,
} = require('../controllers/customerController');

router.use(protect);
router.use(authorize('customer'));

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/update', updateCartItem);
router.delete('/cart/remove/:productId', removeFromCart);
router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/reviews', addReview);
router.get('/shop/:id/location', getShopLocationById);  // ← NEW ROUTE FOR LOCATION

module.exports = router;