const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendWelcomeEmail } = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return errorResponse(res, 'User already exists with this email or username', 400);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      phone,
      address: address || {},
      role: role || 'customer',
    });

    // Send welcome email
    await sendWelcomeEmail(email, fullName);

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVendorApproved: user.isVendorApproved,
    };

    successResponse(res, { user: userData, token }, 'Registration successful', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVendorApproved: user.isVendorApproved,
      shopId: user.shopId,
    };

    successResponse(res, { user: userData, token }, 'Login successful');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('shopId');

    successResponse(res, { user }, 'User profile retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = { register, login, getMe };