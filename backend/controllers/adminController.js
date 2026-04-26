const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const Setting = require('../models/Setting');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==================== VENDOR MANAGEMENT ====================

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

// Suspend vendor
const suspendVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);
    if (vendor.role !== 'vendor') return errorResponse(res, 'User is not a vendor', 400);

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    successResponse(res, { vendor }, `Vendor ${vendor.isActive ? 'activated' : 'suspended'}`);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== '') query.role = role;

    const users = await User.find(query)
      .select('-password')
      .populate('shopId')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    successResponse(res, {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Suspend/Activate user
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot suspend admin user', 403);

    user.isActive = !user.isActive;
    await user.save();

    successResponse(res, { user }, `User ${user.isActive ? 'activated' : 'suspended'} successfully`);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with pagination
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, isVisible } = req.query;
    const query = {};

    if (isVisible !== undefined && isVisible !== '') {
      query.isVisible = isVisible === 'true';
    }

    const products = await Product.find(query)
      .populate('shopId')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    successResponse(res, {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Toggle product visibility (hide/unhide)
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

// ==================== ORDER MANAGEMENT ====================

// Get all orders with pagination
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== '') query.status = status;

    const orders = await Order.find(query)
      .populate('customerId', 'fullName email')
      .populate('items.productId')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    successResponse(res, {
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== STATISTICS ====================

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const approvedVendors = await User.countDocuments({ role: 'vendor', isVendorApproved: true });
    const pendingVendors = totalVendors - approvedVendors;

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isVisible: true, stock: { $gt: 0 } });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.adminCommission || 0), 0);
    const totalSales = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customerId', 'fullName')
      .sort('-createdAt')
      .limit(10);

    successResponse(res, {
      totalUsers,
      users: { 
        customers: totalCustomers, 
        vendors: { 
          total: totalVendors, 
          approved: approvedVendors, 
          pending: pendingVendors 
        } 
      },
      totalProducts,
      products: { active: activeProducts },
      totalOrders,
      orders: { 
        pending: pendingOrders, 
        completed: completedOrders, 
        cancelled: cancelledOrders 
      },
      totalRevenue,
      totalSales,
      recentOrders,
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== SETTINGS ====================

// Get settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    successResponse(res, { settings: settingsObj });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Update setting
const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id },
      { upsert: true, new: true }
    );

    successResponse(res, { setting }, 'Setting updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Vendor Management
  getPendingVendors,
  approveVendor,
  suspendVendor,
  
  // User Management
  getAllUsers,
  suspendUser,
  
  // Product Management
  getAllProducts,
  toggleProductVisibility,
  
  // Order Management
  getAllOrders,
  
  // Statistics
  getSystemStats,
  
  // Settings
  getSettings,
  updateSetting,
};