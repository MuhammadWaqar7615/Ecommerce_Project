const express = require('express');
const passport = require('passport');
const { errorResponse } = require('../utils/apiResponse');
const router = express.Router();
const {
  register,
  sendVerificationLink,
  verifyEmail,
  login,
  googleCallback,
  sendPasswordResetLink,
  resetPasswordWithLink,
  getMe,
  logout,
} = require('../controllers/authController');
const { protectAsync } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  sendVerificationValidation,
  sendResetLinkValidation,
  resetPasswordValidation,
} = require('../validations/authValidation');
const { validate } = require('../middleware/validationMiddleware');

// ==================== MANUAL REGISTRATION & EMAIL VERIFICATION ====================
// Register with email
router.post('/register', registerValidation, validate, register);

// Send verification email (resend)
router.post('/send-verification', sendVerificationValidation, validate, sendVerificationLink);

// Verify email with token
router.post('/verify-email', verifyEmailValidation, validate, verifyEmail);

// ==================== LOGIN - PASSPORT LOCAL STRATEGY ====================
// Login with email/username and password
router.post('/login', loginValidation, validate, (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse(res, err.message || 'Login failed. Please try again.', 500);
    }
    if (!user) {
      return errorResponse(
        res,
        info?.message || 'Email/username or password is incorrect',
        401
      );
    }
    req.user = user;
    next();
  })(req, res, next);
}, login);

// ==================== GOOGLE OAUTH ====================
// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth-error' }),
  googleCallback
);

// ==================== PASSWORD RESET WITH MAGIC LINK ====================
// Send password reset link
router.post('/send-reset-link', sendResetLinkValidation, validate, sendPasswordResetLink);

// Reset password with magic link token
router.post('/reset-password', resetPasswordValidation, validate, resetPasswordWithLink);

// ==================== USER PROFILE ====================
// Get current user profile (protected route)
router.get('/me', protectAsync, getMe);

// Logout
router.post('/logout', protectAsync, logout);

module.exports = router;