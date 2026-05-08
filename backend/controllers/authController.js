const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../services/emailService');

// ==================== REGISTER ====================
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address, role } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return errorResponse(res, 'Email, password, and full name are required', 400);
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (userExists) {
      return errorResponse(res, 'User already exists with this email or username', 400);
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (not verified yet)
    const user = await User.create({
      username: username || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      fullName,
      phone: phone || '',
      address: address || {},
      role: role || 'customer',
      provider: 'local',
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpire,
    });

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    successResponse(
      res,
      { user: userData },
      'Registration successful! Please check your email to verify your account.',
      201
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== SEND VERIFICATION EMAIL ====================
const sendVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.isEmailVerified) {
      return errorResponse(res, 'Email is already verified', 400);
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpire = emailVerificationExpire;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

    successResponse(res, {}, 'Verification email sent successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== VERIFY EMAIL ====================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 'Verification token is required', 400);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(
        res,
        'Invalid or expired verification token',
        400
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.fullName);

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isVendorApproved: user.isVendorApproved,
    };

    successResponse(
      res,
      { user: userData, token: jwtToken },
      'Email verified successfully!',
      200
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== LOGIN (Passport Local) ====================
const login = async (req, res) => {
  try {
    // Passport local strategy has already validated the user
    const user = await User.findById(req.user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isVendorApproved: user.isVendorApproved,
      shopId: user.shopId,
    };

    successResponse(res, { user: userData, token }, 'Login successful');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== GOOGLE OAUTH CALLBACK ====================
const googleCallback = async (req, res) => {
  try {
    // Passport Google strategy has already created/updated the user
    const user = await User.findById(req.user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isVendorApproved: user.isVendorApproved,
      shopId: user.shopId,
      provider: user.provider,
    };

    // Send back token via redirect or query parameter
    // Frontend can extract token from URL and store in localStorage
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== SEND PASSWORD RESET LINK ====================
const sendPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return successResponse(
        res,
        {},
        'If a user with that email exists, a password reset link will be sent'
      );
    }

    // Generate magic link token
    const magicLinkToken = crypto.randomBytes(32).toString('hex');
    const magicLinkExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.magicLinkToken = magicLinkToken;
    user.magicLinkExpire = magicLinkExpire;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, magicLinkToken);

    successResponse(res, {}, 'Password reset link sent successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== RESET PASSWORD WITH MAGIC LINK ====================
const resetPasswordWithLink = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return errorResponse(res, 'Token and password are required', 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const user = await User.findOne({
      magicLinkToken: token,
      magicLinkExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset link', 400);
    }

    // Update password
    user.password = password;
    user.magicLinkToken = null;
    user.magicLinkExpire = null;
    await user.save();

    successResponse(res, {}, 'Password reset successfully! Please log in with your new password');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== GET CURRENT USER ====================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('shopId');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      address: user.address,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isVendorApproved: user.isVendorApproved,
      shopId: user.shopId,
      provider: user.provider,
    };

    successResponse(res, { user: userData }, 'User profile retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== LOGOUT ====================
const logout = async (req, res) => {
  try {
    successResponse(res, {}, 'Logged out successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  register,
  sendVerificationLink,
  verifyEmail,
  login,
  googleCallback,
  sendPasswordResetLink,
  resetPasswordWithLink,
  getMe,
  logout,
};