const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { successResponse } = require('../utils/apiResponse');

// Public search
router.get('/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
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
    
    const products = await Product.find(query).populate('shopId');
    successResponse(res, { products });
  } catch (error) {
    errorResponse(res, error.message);
  }
});

// Get categories
router.get('/categories', (req, res) => {
  const categories = ['Food', 'Crafts', 'Sandals', 'Home Decor', 'Other'];
  successResponse(res, { categories });
});

module.exports = router;