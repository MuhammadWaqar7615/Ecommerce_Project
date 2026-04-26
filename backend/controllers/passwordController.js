const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Send OTP to email
const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Please provide your email address', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'No account found with this email address', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = otpExpire;
    await user.save();

    // Send email with OTP
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #8B5E3C;">Crafts & Delights</h2>
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password. Use the code below to continue:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #999; font-size: 11px;">Crafts & Delights - Khanewal, Pakistan</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset OTP - Crafts & Delights', html);

    successResponse(res, { email }, 'OTP sent to your email address');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 'Email and OTP are required', 400);
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    }).select('+resetPasswordOTP');

    if (!user) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    successResponse(res, { verified: true }, 'OTP verified successfully');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'OTP verification failed', 500);
  }
};

// Step 3: Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, 'Email, OTP, and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() }
    }).select('+resetPasswordOTP');

    if (!user) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #8B5E3C;">Crafts & Delights</h2>
        <h3>Password Reset Successful</h3>
        <p>Your password has been successfully reset.</p>
        <p>You can now <a href="${process.env.CLIENT_URL}/login" style="color: #8B5E3C;">login</a> with your new password.</p>
        <hr>
        <p style="color: #999; font-size: 11px;">If you didn't do this, please contact support immediately.</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset Successful - Crafts & Delights', html);

    successResponse(res, null, 'Password reset successful. Please login with your new password.');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Failed to reset password', 500);
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'No account found with this email address', 404);
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = otpExpire;
    await user.save();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #8B5E3C;">Crafts & Delights</h2>
        <h3>New Password Reset OTP</h3>
        <p>Your new OTP is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(email, 'New Password Reset OTP - Crafts & Delights', html);

    successResponse(res, null, 'New OTP sent to your email');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Failed to resend OTP', 500);
  }
};

module.exports = {
  sendResetOTP,
  verifyOTP,
  resetPassword,
  resendOTP,
};