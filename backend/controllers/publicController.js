const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get dynamic categories from existing products
const getCategories = async (req, res) => {
  try {
    // Get distinct categories from ALL products
    const categories = await Product.distinct('category');
    
    // Filter out empty, null, or undefined categories
    const validCategories = categories.filter(cat => cat && cat.trim().length > 0);
    
    // Sort alphabetically
    validCategories.sort();
    
    console.log('Dynamic categories from DB:', validCategories);
    
    successResponse(res, { categories: validCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
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