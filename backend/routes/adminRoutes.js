const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getPendingVendors,
  approveVendor,
  suspendVendor,
  getAllUsers,
  suspendUser,
  getAllProducts,
  toggleProductVisibility,
  getAllOrders,
  getSystemStats,
  getSettings,
  updateSetting,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

// Vendor Management
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/suspend', suspendVendor);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);

// Product Management
router.get('/products', getAllProducts);
router.put('/products/:id/toggle', toggleProductVisibility);

// Order Management
router.get('/orders', getAllOrders);

// Statistics
router.get('/stats', getSystemStats);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSetting);

module.exports = router;