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
  hideProduct,
  showProduct,
  deleteProduct,
  getCategoriesForVendor,
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
router.put('/products/:id/hide', hideProduct);
router.put('/products/:id/show', showProduct);
router.delete('/products/:id', deleteProduct);
router.get('/categories', getCategoriesForVendor);  // ← USE THE CONTROLLER FUNCTION
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/revenue', getRevenueAnalytics);

module.exports = router;