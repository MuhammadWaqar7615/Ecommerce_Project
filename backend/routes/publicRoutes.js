const express = require('express');
const router = express.Router();
const { getCategories, searchProducts } = require('../controllers/publicController');

// Public search
router.get('/search', searchProducts);

// Get categories - Now calls the controller for dynamic categories
router.get('/categories', getCategories);

module.exports = router;