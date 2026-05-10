const express = require('express');
const router = express.Router();
const { getCategories, getProductById, searchProducts } = require('../controllers/publicController');

// Public search
router.get('/search', searchProducts);

// Public product detail
router.get('/products/:id', getProductById);

// Get categories - Now calls the controller for dynamic categories
router.get('/categories', getCategories);

module.exports = router;