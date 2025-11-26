const { body } = require('express-validator');

// Validation rules for Registering
const registerRules = [
  // Name: Required, trimmed, min length 3
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  // Email: Must be valid email, normalize (lowercase)
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // Password: Min length 6
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  // Address (Optional but must be strings if provided)
  body('address.country').optional().trim().isString(),
  body('address.city').optional().trim().isString(),
  body('address.street').optional().trim().isString(),
  body('address.postalCode').optional().trim().isString(),

  // SECURITY NOTE: We purposely DO NOT include 'role' or 'token' here.
];

// Validation rules for Logging In
const loginRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = { registerRules, loginRules };