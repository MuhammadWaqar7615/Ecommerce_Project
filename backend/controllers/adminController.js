const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const Setting = require('../models/Setting');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get pending vendors
const getPendingVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      role: 'vendor',
      isVendorApproved: false,
    }).select('-password');
    
    successResponse(res, { vendors });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Approve vendor
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isVendorApproved: true },
      { new: true }
    );
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);
    
    successResponse(res, { vendor }, 'Vendor approved');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get all products (admin)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('shopId');
    successResponse(res, { products });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Toggle product visibility
const toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);
    
    product.isVisible = !product.isVisible;
    await product.save();
    
    successResponse(res, { product }, `Product ${product.isVisible ? 'visible' : 'hidden'}`);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'fullName email')
      .sort('-createdAt');
    
    successResponse(res, { orders });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get system stats
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$adminCommission' } } }
    ]);
    
    successResponse(res, {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update settings
const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    successResponse(res, { setting }, 'Setting updated');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    successResponse(res, { settings: settingsObj });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  getPendingVendors,
  approveVendor,
  getAllProducts,
  toggleProductVisibility,
  getAllOrders,
  getSystemStats,
  updateSetting,
  getSettings,
};