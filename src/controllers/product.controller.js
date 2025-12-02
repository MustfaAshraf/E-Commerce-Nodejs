const Product = require('../models/product.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { matchedData } = require('express-validator'); // Import this!

// 1. GET: Show the "Add Product" Form
exports.getAddProductPage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('products/add-product', {
      pageTitle: 'Add Product',
      categories: categories,
      userInput: {}, // Empty start
      message: null,
      editing: false
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
};

// 2. POST: Create the Product
exports.createProduct = async (req, res) => {
  try {
    const data = matchedData(req);

    if (!req.file) {
      // If no image, render error (and we don't need to delete anything)
      const categories = await Category.find();
      return res.status(400).render('products/add-product', {
        message: 'Product image is required',
        categories,
        userInput: req.body,
        editing: false
      });
    }

    // C. Create Product
    await Product.create({
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity || 0,
      category: data.category,
      image: req.file.filename,
      owner: req.user._id // <--- CRITICAL: Save the logged-in user ID
    });

    // D. Success -> Redirect to Shop
    return res.redirect('/shop');

  } catch (err) {
    console.error(err);
    // If DB fails (e.g., connection lost), we must delete the uploaded image
    // to prevent "garbage" files in our server
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    }
    return res.status(500).render('error', { message: 'Database creation failed' });
  }
};

// 3. GET: Show All Products (Shop Page)
exports.getProducts = async (req, res) => {
  try {
    // 1. FILTERING LOGIC
    // ------------------
    const filter = {};

    // A. Search by Name (Case insensitive)
    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // B. Filter by Category
    if (req.query.category) {
        filter.category = req.query.category;
    }

    // C. Filter by Price Range
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // 2. SORTING LOGIC
    // ----------------
    let sort = { createdAt: -1 }; // Default: Newest first

    if (req.query.sort === 'price_asc') {
        sort = { price: 1 }; // Low to High
    } else if (req.query.sort === 'price_desc') {
        sort = { price: -1 }; // High to Low
    } else if (req.query.sort === 'newest') {
        sort = { createdAt: -1 };
    }

    // 3. PAGINATION LOGIC
    // -------------------
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // 9 products per page (fits 3x3 grid)
    const skip = (page - 1) * limit;

    // 4. DATABASE QUERIES (Parallel for speed)
    // ----------------------------------------
    // We need:
    // a) The products (filtered, sorted, paginated)
    // b) The total count (for pagination buttons)
    // c) The categories (for the sidebar list)
    
    const [products, totalProducts, categories] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('category'),
        
        Product.countDocuments(filter),
        
        Category.find().sort({ name: 1 }) // Fetch categories for the sidebar
    ]);

    // 5. RENDER VIEW
    // --------------
    res.render('products/shop', {
        pageTitle: 'Shop',
        
        // Data
        products: products,
        categories: categories, // Needed for Sidebar Loop
        
        // Pagination Math
        currentPage: page,
        hasNextPage: (limit * page) < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / limit),
        
        // Pass query back so filters stick (e.g. minPrice stays in input)
        query: req.query 
    });

  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).render('error', { message: 'Could not load products' });
  }
};

// 4. GET: Show Single Product Details
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('owner', 'name'); // Show owner name?

    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    return res.render('shop/single', {
      pageTitle: product.name,
      product: product
    });

  } catch (err) {
    return res.status(500).render('error', { message: err.message });
  }
};

exports.getEditProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).render('error', { message: 'Product not found' });
    }

    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).render('error', { message: 'Not authorized to edit this product' });
    }

    const categories = await Category.find();

    res.render('products/add-product', { 
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        product: product,
        categories: categories,
        userInput: product,
        message: null 
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: err.message 
    });
  }
};

// 5. POST: Update Product (Admin/Owner)
exports.updateProduct = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'description', 'price', 'quantity', 'category'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
      res.status(400).render('error', { 
      message: 'Category ID is invalid' 
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
          path.join(__dirname, '../../uploads/productImages', newImage),() => { }
        );
      }

      return res.status(404).render('error',{ 
        message: 'Product not found' 
      })
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
            return res.status(400).render('error', {
                message: 'Error deleting image'
              })
          }
        });
      }
    }

    return res.status(200).render('product', { 
      product: updatedProduct 
    })

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: err.message 
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).render('error', {
        message: 'Product not found'
      })
    if (product.image) {
      const imagePath = path.join(__dirname, '../../uploads/productImages', product.image);

      // check first to avoid errors
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            return res.status(400).render('error', {
                message: 'Error deleting image'
              });
          }
        });
      }
    }

    return res.status(200).render('shop')
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: err.message 
    });
  }
};