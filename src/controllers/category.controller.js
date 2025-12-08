const Category = require('../models/category.model');
const Product = require('../models/product.model');
// We don't strictly need matchedData here if we trust the admin input, 
// but checking req.body is standard for MVC forms.

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
// 1. GET: Show Admin Categories Page
exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Render the view 'src/views/admin/categories.ejs'
    res.render('admin/categories', {
      pageTitle: 'Manage Categories',
      categories: categories,
      user: req.user,
      error: req.query.error === 'HasProducts' ? 'Cannot delete: Category has products.' : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server Error loading categories' });
  }
};

// 2. POST: Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body; // Form data comes in req.body

    // Basic Validation
    if (!name || name.trim() === "") {
      throw new Error("Category name cannot be empty");
    }

    // Check for duplicates
    // RegExp ensures case-insensitive check (e.g., 'Laptop' vs 'laptop')
    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (exists) {
      throw new Error("Category already exists");
    }

    await Category.create({ name: name.trim() });

    // Success: Refresh the page
    res.redirect('/admin/categories');

  } catch (err) {
    // Error: Re-render page with the error message
    const categories = await Category.find().sort({ name: 1 });
    res.render('admin/categories', {
      pageTitle: 'Manage Categories',
      categories: categories,
      user: req.user,
      error: err.message // Send specific error to view
    });
  }
};

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

// 3. POST: Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    // Safety Check: Do not delete if products are using this category
    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      // Redirect with an error flag
      return res.redirect('/admin/categories?error=HasProducts');
    }

    await Category.findByIdAndDelete(id);

    res.redirect('/admin/categories');

  } catch (err) {
    console.error(err);
    // On server error, simple redirect (or render error page)
    res.redirect('/admin/categories');
  }
};

// 4. GET: Show Edit Page
exports.getEditCategoryPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.redirect('/dashboard/categories');
        }

        res.render('admin/category-edit', {
            pageTitle: 'Edit Category',
            category: category,
            user: req.user,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/categories');
    }
};

// 5. POST: Handle Update
exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;

        // 1. Basic Validation
        if (!name || name.trim() === "") {
            throw new Error("Category name cannot be empty");
        }

        // 2. Check Duplicates (exclude current category ID)
        // logic: Find a category with this Name AND _id is NOT this one
        const exists = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: id } 
        });

        if (exists) {
            throw new Error("Category name already exists");
        }

        // 3. Update
        await Category.findByIdAndUpdate(id, { name: name.trim() });

        res.redirect('/dashboard/categories');

    } catch (err) {
        // If error, show form again with error message
        const category = await Category.findById(req.params.id);
        res.render('admin/category-edit', {
            pageTitle: 'Edit Category',
            category: category,
            user: req.user,
            error: err.message
        });
    }
};