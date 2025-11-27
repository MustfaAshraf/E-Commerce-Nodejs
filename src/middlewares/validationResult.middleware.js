const { validationResult } = require('express-validator');
const fs = require('fs'); // Import fs

const validate = (viewName) => {
  return (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting garbage file:", err);
        });
      }

      const firstError = errors.array()[0].msg;
      
      return res.status(400).render(viewName, {
        message: firstError,
        userInput: req.body,
      });
    }

    next();
  };
};

module.exports = validate;