const { validationResult } = require('express-validator');

// This middleware checks if the previous validation rules found any errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // If errors exist, stop here and send 400 Bad Request
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({ 
        field: err.path, 
        message: err.msg 
        }))
    });
  }
  
  // If no errors, proceed to controller
  next();
};

module.exports = validate;