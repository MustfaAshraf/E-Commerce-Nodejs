const { body } = require('express-validator');

const categoryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long')
    .customSanitizer(value => value.charAt(0).toUpperCase() + value.slice(1)) // Auto-Capitalize
];

module.exports = { categoryRules };