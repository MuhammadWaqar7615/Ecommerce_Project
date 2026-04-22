const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createShop,
  getShop,
  updateShop,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getRevenueAnalytics,
} = require('../controllers/vendorController');

router.use(protect);
router.use(authorize('vendor'));

router.post('/shop', createShop);
router.get('/shop', getShop);
router.put('/shop', updateShop);
router.get('/products', getProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/revenue', getRevenueAnalytics);

module.exports = router;