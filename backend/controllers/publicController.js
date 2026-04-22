const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { PRODUCT_CATEGORIES } = require('../config/constants');

// Get categories
const getCategories = async (req, res) => {
  try {
    successResponse(res, { categories: PRODUCT_CATEGORIES });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const query = { isVisible: true, stock: { $gt: 0 } };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
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
      searchTerm: q || '',
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getCategories,
  searchProducts,
};