const { body } = require('express-validator');

const productRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description is too long'),

  // Validate that the Category ID sent is a valid Mongo ID
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid Category ID format'),
];

module.exports = { productRules };