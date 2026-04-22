const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getPendingVendors,
  approveVendor,
  getAllProducts,
  toggleProductVisibility,
  getAllOrders,
  getSystemStats,
  updateSetting,
  getSettings,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.get('/products', getAllProducts);
router.put('/products/:id/toggle', toggleProductVisibility);
router.get('/orders', getAllOrders);
router.get('/stats', getSystemStats);
router.get('/settings', getSettings);
router.put('/settings', updateSetting);

module.exports = router;