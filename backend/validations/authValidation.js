const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Please enter a valid phone number'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .custom((value) => {
      // Allow either email format or username format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      // if email contains '@', validate as email, otherwise validate as username
      if (value.includes('@')) {
        if (emailRegex.test(value)) {
          return true;
        }
        throw new Error('Please enter a valid email');
      } else {
        if (usernameRegex.test(value)) {
          return true;
        }
        throw new Error('Username must be 3-30 characters and can only contain letters, numbers, and underscores');
      }
   
      if ( emailRegex.test(value) || usernameRegex.test(value)) {
        return true;
      }
      throw new Error('Please enter a valid email or username');
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const verifyEmailValidation = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Verification token is required'),
];

const sendVerificationValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
];

const sendResetLinkValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password'),
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  sendVerificationValidation,
  sendResetLinkValidation,
  resetPasswordValidation,
};