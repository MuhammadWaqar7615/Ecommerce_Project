const express = require('express');
const router = express.Router();
const {
  sendResetOTP,
  verifyOTP,
  resetPassword,
  resendOTP,
} = require('../controllers/passwordController');

router.post('/send-otp', sendResetOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

module.exports = router;