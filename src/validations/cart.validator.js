const { body } = require('express-validator');

const cartRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid Product ID'),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt() // Convert string "1" to number 1
];

const couponRules = [
  body('code')
    .optional({ checkFalsy: true }) // Allow empty string (to remove coupon)
    .trim()
    .isString()
];

module.exports = { cartRules, couponRules };