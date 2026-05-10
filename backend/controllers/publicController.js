const Product = require('../models/Product');
const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const resolveCategoryFilter = async (categoryValue) => {
  if (!categoryValue) return null;
  const trimmed = String(categoryValue).trim();

  if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    const category = await Category.findById(trimmed);
    if (category) return category._id;
  }

  const category = await Category.findOne({
    $or: [
      { name: trimmed },
      { slug: trimmed.toLowerCase().replace(/ /g, '-') },
    ],
  });
  return category ? category._id : null;
};

// Get dynamic categories from category collection
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    successResponse(res, { categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get single product by id for public access
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shopId')
      .populate('category', 'name');
    if (!product || !product.isVisible || product.stock <= 0) {
      return errorResponse(res, 'Product not available', 404);
    }
    successResponse(res, { product });
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

    if (category) {
      const categoryId = await resolveCategoryFilter(category);
      if (!categoryId) {
        return successResponse(res, { products: [], totalPages: 0, currentPage: page, total: 0 });
      }
      query.category = categoryId;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('shopId')
      .populate('category', 'name')
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
  getProductById,
  searchProducts,
};