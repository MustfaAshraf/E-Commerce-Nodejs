const Category = require('../models/category.model');
const Product = require('../models/product.model');
const { matchedData } = require('express-validator');

// 1. GET: Fetch all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        return res.status(200).json({
            status: 'success',
            results: categories.length,
            data: { categories }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Server Error'
        });
    }
};

// 2. POST: Create a new category
exports.createCategory = async (req, res) => {
    try {
        // Use matchedData to get clean, validated input
        const data = matchedData(req);

        // Check for duplicates
        const exists = await Category.findOne({ name: data.name });
        if (exists) {
            return res.status(400).json({
                status: 'fail',
                message: 'Category already exists'
            });
        }

        const category = await Category.create(data);

        return res.status(201).json({
            status: 'success',
            data: { category }
        });

    } catch (err) {
        // Handle unique constraint error from Mongoose just in case
        if (err.code === 11000) {
            return res.status(400).json({ status: 'fail', message: 'Category already exists' });
        }
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// 3. DELETE: Remove category (Safety Check)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // CRITICAL: Prevent deleting a category if products use it
        const productsCount = await Product.countDocuments({ category: id });
        
        if (productsCount > 0) {
            return res.status(400).json({
                status: 'fail',
                message: `Cannot delete category. It contains ${productsCount} products.`
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: null
        });

    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// 4. PATCH: Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    if (data.name && data.name !== category.name) {
      const duplicate = await Category.findOne({ name: data.name });
      if (duplicate) {
        return res.status(400).json({
          status: 'fail',
          message: 'Category name already exists'
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      { name: data.name },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: 'success',
      data: { category: updatedCategory }
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};