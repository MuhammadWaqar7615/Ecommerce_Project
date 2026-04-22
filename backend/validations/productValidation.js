const { body } = require('express-validator');

const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Product name must be at least 3 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('category')
    .isIn(['Food', 'Crafts', 'Sandals', 'Home Decor', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

module.exports = { productValidation };