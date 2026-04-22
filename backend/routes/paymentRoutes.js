const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPaymentIntent, processRefund } = require('../controllers/paymentController');

router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.post('/refund', processRefund);

module.exports = router;