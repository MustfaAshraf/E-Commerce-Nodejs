const Category = require("../models/category.model");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({
        status: "fail",
        message: "Category already exists",
      });
    }

    const category = await Category.create({ name });

    return res.status(201).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).json({
      status: "success",
      data: { categories },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category deleted",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
