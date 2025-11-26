const Product = require('../models/product.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

exports.createProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity } = req.body;

    // basic validation
    if (!name || !category || !price) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'name, category and price are required' }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'invalid category id' }
      });
    }

    const cat = await Category.findById(category);
    if (!cat) {
        return res.status(404).json({ 
            status: 'fail', 
            data: { 
                message: 'Category not found' 
            } 
        });
    }

    const product = await Product.create({
      name,
      category,
      description,
      price,
      quantity: quantity || 0,
      image: req.file ? req.file.filename : undefined
    });

    return res.status(201).json({ 
        status: 'success', 
        data: { product } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
        status: 'error', 
        message: err.message 
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // simple pagination & filtering
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.category && mongoose.Types.ObjectId.isValid(query.category)) {
      filter.category = query.category;
    }
    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }
    if (query.minPrice) filter.price = { ...(filter.price || {}), $gte: Number(query.minPrice) };
    if (query.maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(query.maxPrice) };

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(filter)
    ]);

    return res.status(200).json({
      status: 'success',
      data: { 
        products, 
        meta: { 
            total, 
            page, 
            limit 
        } }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
        status: 'error', 
        message: err.message 
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        return res.status(404).json({ 
            status: 'fail', 
            data: { 
                message: 'Product not found' 
            } 
        });
    }
    return res.status(200).json({ 
        status: 'success', 
        data: { product } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
        status: 'error', 
        message: err.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'description', 'price', 'quantity', 'category'];

    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'Invalid category id' }
      });
    }

    // If a new file is uploaded, we need to delete old image later
    const newImage = req.file ? req.file.filename : null;

    // First, fetch product to know the old image filename
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      // If product not found and we uploaded an image, delete the new upload to avoid orphan files
      if (newImage) {
        fs.unlink(
          path.join(__dirname, '../../uploads/productImages', newImage),
          () => {}
        );
      }

      return res.status(404).json({
        status: 'fail',
        data: { message: 'Product not found' }
      });
    }

    // If new image exists, set the update value
    if (newImage) updates.image = newImage;

    // Apply update
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('category');

    // If new image was uploaded, delete the old one
    if (newImage && existingProduct.image) {
      const oldImagePath = path.join(
        __dirname,
        '../../uploads/productImages',
        existingProduct.image
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            return res.status(400).json({ 
                status: 'fail', 
                data: { 
                    message: 'Error deleting image' 
                } 
            });
          }
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: { product: updatedProduct }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ 
        status: 'fail', 
        data: { 
            message: 'Product not found' 
        } 
    });

    if (product.image) {
      const imagePath = path.join(__dirname, '../../uploads/productImages', product.image);

      // check first to avoid errors
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            return res.status(400).json({ 
                status: 'fail', 
                data: { 
                    message: 'Error deleting image' 
                } 
            });
          }
        });
      }
    }

    return res.status(200).json({ 
        status: 'success', 
        data: { 
            message: 'Product deleted' 
        } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
        status: 'error', 
        message: err.message 
    });
  }
};
