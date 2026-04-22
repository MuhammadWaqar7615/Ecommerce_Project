const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Create shop
const createShop = async (req, res) => {
  try {
    const existingShop = await Shop.findOne({ vendorId: req.user._id });
    if (existingShop) {
      return errorResponse(res, 'You already have a shop', 400);
    }
    
    const shop = await Shop.create({
      vendorId: req.user._id,
      ...req.body,
    });
    
    await User.findByIdAndUpdate(req.user._id, { shopId: shop._id });
    
    successResponse(res, { shop }, 'Shop created', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get shop
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return errorResponse(res, 'Shop not found', 404);
    successResponse(res, { shop });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update shop
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { vendorId: req.user._id },
      req.body,
      { new: true }
    );
    if (!shop) return errorResponse(res, 'Shop not found', 404);
    successResponse(res, { shop }, 'Shop updated');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get vendor products
const getProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return errorResponse(res, 'Shop not found', 404);
    
    const products = await Product.find({ shopId: shop._id });
    successResponse(res, { products });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Add product
const addProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) return errorResponse(res, 'Create shop first', 400);
    
    const product = await Product.create({
      ...req.body,
      shopId: shop._id,
    });
    
    successResponse(res, { product }, 'Product added', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      req.body,
      { new: true }
    );
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product }, 'Product updated');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      { isVisible: false },
      { new: true }
    );
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, null, 'Product removed');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get vendor orders
const getOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const orders = await Order.find({ 'items.shopId': shop._id })
      .populate('customerId', 'fullName email')
      .sort('-createdAt');
    
    successResponse(res, { orders });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return errorResponse(res, 'Order not found', 404);
    
    order.status = status;
    if (status === 'Delivered') order.deliveredAt = new Date();
    await order.save();
    
    successResponse(res, { order }, 'Status updated');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const orders = await Order.find({
      'items.shopId': shop._id,
      paymentStatus: 'Paid',
    });
    
    let totalEarnings = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.shopId.toString() === shop._id.toString()) {
          totalEarnings += item.price * item.quantity;
        }
      });
    });
    
    successResponse(res, {
      totalEarnings,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalEarnings / orders.length : 0,
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  createShop,
  getShop,
  updateShop,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getRevenueAnalytics,
};