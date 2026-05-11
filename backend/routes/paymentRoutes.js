const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPublicKey, createPaymentIntent, processRefund } = require('../controllers/paymentController');

// Public endpoint - no authentication required
router.get('/public-key', getPublicKey);

// Protected endpoints - authentication required
router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.post('/refund', processRefund);

module.exports = router;