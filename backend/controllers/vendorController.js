const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');  // ← ADD THIS IMPORT
const { successResponse, errorResponse } = require('../utils/apiResponse');

const resolveCategoryId = async (categoryValue) => {
  if (!categoryValue) return null;
  const trimmed = String(categoryValue).trim();

  if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    const existingCategory = await Category.findById(trimmed);
    if (existingCategory) return existingCategory._id;
  }

  const existingCategory = await Category.findOne({ name: trimmed });
  return existingCategory ? existingCategory._id : null;
};

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

    const products = await Product.find({ shopId: shop._id }).populate('category', 'name');
    successResponse(res, { products });
  } catch (error) {
    errorResponse(res, error.message);
  }
};
// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, shopId: shop._id })
      .populate('category', 'name');

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    successResponse(res, { product });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Add product
const addProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    if (!shop) {
      return errorResponse(res, 'Create shop first', 400);
    }

    let { name, description, category, price, stock, images } = req.body;

    if (!category) {
      return errorResponse(res, 'Category is required', 400);
    }

    const resolvedCategory = await resolveCategoryId(category);
    if (!resolvedCategory) {
      return errorResponse(res, 'Invalid category. Use an existing category.', 400);
    }

    const product = await Product.create({
      shopId: shop._id,
      name,
      description,
      category: resolvedCategory,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: images || [],
    });

    successResponse(res, { product }, 'Product added successfully', 201);
  } catch (error) {
    console.error('Add product error:', error);
    errorResponse(res, error.message, 500);
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, shopId: shop._id });

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const { name, description, category, price,isVisible, stock, images } = req.body;

    let resolvedCategory = product.category;
    if (category && category !== String(product.category)) {
      resolvedCategory = await resolveCategoryId(category);
      if (!resolvedCategory) {
        return errorResponse(res, 'Invalid category. Use an existing category.', 400);
      }
    }

    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.category = resolvedCategory;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;
    product.isVisible = isVisible !== undefined ? isVisible : product.isVisible;
    await product.save();

    successResponse(res, { product }, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, error.message, 500);
  }
};

// Hide product (soft delete - set invisible)
const hideProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      { isVisible: false },
      { new: true }
    );
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product }, 'Product hidden successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Show product (make visible again)
const showProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      { isVisible: true },
      { new: true }
    );
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, { product }, 'Product shown successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Permanently delete product (hard delete)
const deleteProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopId: shop._id
    });
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, null, 'Product permanently deleted');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get all categories for vendor dropdown
const getCategoriesForVendor = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    successResponse(res, { categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get vendor orders (only orders containing vendor's products)
const getOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });

    if (!shop) {
      return successResponse(res, { orders: [] });
    }

    const orders = await Order.find({ 'items.shopId': shop._id })
      .populate('customerId', 'fullName email phone')
      .populate('items.productId', 'name price images')
      .sort('-createdAt');

    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item =>
        item.shopId && item.shopId.toString() === shop._id.toString()
      )
    }));

    successResponse(res, { orders: filteredOrders });
  } catch (error) {
    console.error('Error in getOrders:', error);
    errorResponse(res, error.message, 500);
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return errorResponse(res, 'Order not found', 404);

    const shop = await Shop.findOne({ vendorId: req.user._id });
    const hasVendorProducts = order.items.some(
      item => item.shopId && item.shopId.toString() === shop._id.toString()
    );

    if (!hasVendorProducts) {
      return errorResponse(res, 'Unauthorized: This order does not contain your products', 403);
    }

    order.status = status;
    if (status === 'Delivered') order.deliveredAt = new Date();
    await order.save();

    successResponse(res, { order }, 'Status updated');
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    errorResponse(res, error.message, 500);
  }
};

// Revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendorId: req.user._id });

    if (!shop) {
      return successResponse(res, {
        totalEarnings: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        earningsByProduct: [],
        monthlyBreakdown: []
      });
    }

    const orders = await Order.find({
      'items.shopId': shop._id,
      paymentStatus: 'Paid',
    });

    let totalEarnings = 0;
    const earningsByProduct = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.shopId && item.shopId.toString() === shop._id.toString()) {
          const productEarnings = item.price * item.quantity;
          totalEarnings += productEarnings;

          const productId = item.productId.toString();
          if (!earningsByProduct[productId]) {
            earningsByProduct[productId] = {
              productId,
              productName: item.productId?.name || 'Unknown',
              quantity: 0,
              earnings: 0
            };
          }
          earningsByProduct[productId].quantity += item.quantity;
          earningsByProduct[productId].earnings += productEarnings;
        }
      });
    });

    successResponse(res, {
      totalEarnings,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalEarnings / orders.length : 0,
      earningsByProduct: Object.values(earningsByProduct)
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createShop,
  getShop,
  updateShop,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  hideProduct,
  showProduct,
  deleteProduct,
  getCategoriesForVendor,  // ← ADD THIS EXPORT
  getOrders,
  updateOrderStatus,
  getRevenueAnalytics,
};