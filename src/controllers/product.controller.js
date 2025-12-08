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
    // 1. Clean Data
    const data = matchedData(req); 

    // 2. Handle Image
    if (!req.file) {
        const categories = await Category.find();
        return res.status(400).render('products/add-product', {
            message: 'Product image is required',
            categories,
            userInput: req.body
        });
    }

    // 3. Create Product
    await Product.create({
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity || 0,
      category: data.category,
      image: req.file.filename,
      
      // ✅ FIX: Manually attach the Owner ID
      // We use req.user.id || req.user._id (depending on how your auth sets it)
      owner: req.user.id
    });

    // 4. Success -> Redirect
    // If Admin/Owner, maybe redirect to Dashboard list instead of Shop?
    // For now, let's go to the admin product list so they see their new item.
    return res.redirect('/dashboard/products');

  } catch (err) {
    console.error("Create Product Error:", err);
    
    // Cleanup image if DB fails
    if (req.file) {
        fs.unlink(req.file.path, (err) => { if(err) console.error(err); });
    }
    
    // Pass categories back so the dropdown doesn't break on error page
    const categories = await Category.find();
    
    return res.status(500).render('products/add-product', {
        pageTitle: 'Add Product',
        categories: categories,
        userInput: req.body,
        message: 'Database creation failed: ' + err.message
    });
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
    const productId = req.params.id;

    // 1. Fetch the Current Product
    const product = await Product.findById(productId).populate('category');
    
    if (!product) {
        return res.status(404).render('error', { message: 'Product not found' });
    }

    // 2. Fetch Categories (For Sidebar)
    const categories = await Category.find().sort({ name: 1 });

    // 3. Fetch Related Products
    // Logic: Same Category, NOT the current ID, Limit to 6 items
    const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: productId } // Exclude current product
    }).limit(6);

    // 4. Render View
    return res.render('products/single', { 
        pageTitle: product.name,
        product: product,
        categories: categories,
        relatedProducts: relatedProducts, // <--- Sent to view
        query: req.query 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).render('error', { message: err.message });
  }
};

exports.getEditProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).render('error', { message: 'Product not found' });
    }

    if (product.owner.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
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
      return res.status(400).render('error', { message: 'Category ID is invalid' });
    }

    // If a new file is uploaded
    const newImage = req.file ? req.file.filename : null;

    // 1. Fetch existing product
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      // Clean up uploaded image if product not found
      if (newImage) {
        fs.unlink(path.join(__dirname, '../../uploads/productImages', newImage), () => {});
      }
      return res.status(404).render('error', { message: 'Product not found' });
    }

    // 2. 🔒 SECURITY CHECK (Fixed Variable Name)
    // We must check 'existingProduct.owner', not 'product.owner'
    if (req.user.role !== 'admin' && existingProduct.owner.toString() !== req.user.id.toString()) {
        return res.status(403).render('error', { message: 'Unauthorized action' });
    }

    // 3. Prepare Image Update
    if (newImage) updates.image = newImage;

    // 4. Apply Update
    await Product.findByIdAndUpdate(req.params.id, updates, { new: true });

    // 5. Delete Old Image (If new one was uploaded)
    if (newImage && existingProduct.image) {
      const oldImagePath = path.join(__dirname, '../../uploads/productImages', existingProduct.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
    }

    // 6. ✅ SUCCESS REDIRECT
    // Don't render a non-existent view. Go back to the Admin Product List.
    return res.redirect('/dashboard/products');

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: err.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Find the product first (DO NOT delete yet)
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).render('error', { message: 'Product not found' });
    }

    // 2. 🔒 SECURITY CHECK (The Critical Logic)
    // Allow if User is Admin OR User is the Owner of this specific product
    if (req.user.role !== 'admin' && product.owner.toString() !== req.user.id.toString()) {
        return res.status(403).render('error', { message: 'You are not authorized to delete this product' });
    }

    // 3. Delete Image from Server
    if (product.image) {
      // Adjust path if necessary based on your folder structure
      const imagePath = path.join(__dirname, '../../uploads/productImages', product.image);

      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image file:", err);
        });
      }
    }

    // 4. Delete Product from DB
    await Product.findByIdAndDelete(productId);

    // 5. Redirect
    // Usually, we redirect back to the Admin Dashboard list, not the Shop view
    return res.redirect('/dashboard/products');

  } catch (err) {
    console.error(err);
    return res.status(500).render('error', { 
      message: err.message 
    });
  }
};