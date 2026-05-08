const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Password reset functionality has been migrated to use Magic Links
 * instead of OTP. Please use the following endpoints instead:
 * 
 * POST /api/auth/send-reset-link - Send password reset link
 * POST /api/auth/reset-password - Reset password with magic link token
 * 
 * These endpoints are kept for backward compatibility but redirect to auth endpoints.
 */

const sendResetOTP = async (req, res) => {
  return errorResponse(
    res,
    'Password reset OTP system has been replaced with Magic Links. Please use POST /api/auth/send-reset-link instead.',
    410
  );
};

const verifyOTP = async (req, res) => {
  return errorResponse(
    res,
    'OTP verification system is deprecated. Please use the magic link system at POST /api/auth/verify-email instead.',
    410
  );
};

const resetPassword = async (req, res) => {
  return errorResponse(
    res,
    'Password reset OTP system has been replaced with Magic Links. Please use POST /api/auth/reset-password instead.',
    410
  );
};

const resendOTP = async (req, res) => {
  return errorResponse(
    res,
    'OTP resend has been replaced with Magic Links. Please use POST /api/auth/send-reset-link instead.',
    410
  );
};

module.exports = { sendResetOTP, verifyOTP, resetPassword, resendOTP };