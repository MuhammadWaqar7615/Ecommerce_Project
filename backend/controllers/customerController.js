const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { calculateShippingFee } = require('../services/shippingService');
const { calculateVendorEarnings } = require('../services/commissionService');
const generateOrderNumber = require('../utils/generateOrderNumber');

// Get products with filters
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, minPrice, maxPrice, search } = req.query;
    const query = { isVisible: true, stock: { $gt: 0 } };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
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
      currentPage: page,
      total,
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId');
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    successResponse(res, { product });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id })
      .populate('items.productId');
    
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }
    
    successResponse(res, { cart });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product || !product.isVisible) {
      return errorResponse(res, 'Product not available', 404);
    }
    
    if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400);
    }
    
    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }
    
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        priceAtAdd: product.price,
      });
    }
    
    await cart.save();
    successResponse(res, { cart }, 'Item added to cart');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return errorResponse(res, 'Cart not found', 404);
    
    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return errorResponse(res, 'Item not in cart', 404);
    
    item.quantity = quantity;
    await cart.save();
    
    successResponse(res, { cart }, 'Cart updated');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) return errorResponse(res, 'Cart not found', 404);
    
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    
    successResponse(res, { cart }, 'Item removed');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, shippingDistance = 5 } = req.body;
    
    const cart = await Cart.findOne({ customerId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty', 400);
    }
    
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = item.productId;
      if (!product || !product.isVisible) {
        return errorResponse(res, `Product not available`, 400);
      }
      
      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        shopId: product.shopId,
        quantity: item.quantity,
        price: product.price,
      });
      
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    const shippingFee = await calculateShippingFee(shippingDistance);
    const totalAmount = subtotal + shippingFee;
    const { adminCommission, vendorEarnings } = await calculateVendorEarnings(totalAmount);
    
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingFee,
      adminCommission,
      vendorEarnings,
      shippingAddress,
      estimatedDistance: shippingDistance,
      status: 'Pending',
      paymentStatus: 'Pending',
    });
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    successResponse(res, { order }, 'Order created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get customer orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('items.productId')
      .sort('-createdAt');
    
    successResponse(res, { orders });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.customerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized', 403);
    }
    if (order.status !== 'Pending') {
      return errorResponse(res, 'Order cannot be cancelled', 400);
    }
    
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();
    
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }
    
    successResponse(res, { order }, 'Order cancelled');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Add review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    const order = await Order.findOne({
      customerId: req.user._id,
      'items.productId': productId,
      status: 'Delivered',
    });
    
    if (!order) {
      return errorResponse(res, 'You can only review purchased products', 400);
    }
    
    const review = await Review.create({
      productId,
      customerId: req.user._id,
      orderId: order._id,
      rating,
      comment,
    });
    
    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
    
    successResponse(res, { review }, 'Review added', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  createOrder,
  getOrders,
  cancelOrder,
  addReview,
};