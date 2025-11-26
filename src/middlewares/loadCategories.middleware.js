const Category = require('../models/category.model');

module.exports = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.locals.categories = categories;
  } catch (err) {
    res.locals.categories = [];
  }
  next();
};
