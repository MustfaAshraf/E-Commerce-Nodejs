const Product = require('../models/product.model');
const Category = require('../models/category.model');

exports.getHome = async (req, res) => {
  try {
        // 1. Fetch Categories (for the top slider or filtering)
        const categories = await Category.find().limit(6);

        // 2. Fetch New Arrivals (Last 6 created)
        const newArrivals = await Product.find()
            .sort({ createdAt: -1 }) // Newest first
            .limit(8);

        // 3. Fetch Best Sellers (Highest 'sold' count)
        const bestSellers = await Product.find()
            .sort({ sold: -1 }) // Highest sales first
            .limit(8);

        // 4. Render View
        res.render('shop/index', { // Assuming your home page is index.ejs
            pageTitle: 'Home',
            categories,
            newArrivals,
            bestSellers
        });

    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load home page' });
    }
};

exports.getBestSeller = async (req, res) => {
  try {
        // Similar to Shop, but hardcoded to sort by Sales
        const products = await Product.find()
            .sort({ sold: -1 })
            .populate('category');

        res.render('products/shop', { // We can reuse the Shop view!
            pageTitle: 'Best Sellers',
            products: products,
            categories: [], // Or fetch them if you want sidebar
            query: { sort: 'bestseller' }, // Fake query to highlight menu
            
            // Mock pagination for now (or implement full logic)
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            lastPage: 1
        });

    } catch (err) {
        res.status(500).render('error', { message: 'Error loading bestsellers' });
    }
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout.ejs');
};

exports.getNotFound = (req, res) => {
  res.render('shop/404.ejs');
};

exports.getLogin = (req, res) => {
  res.render("auth/login.ejs",{
    message: null,
    userInput: {}
  });
};

exports.getRegister = (req, res) => {
  res.render("auth/register.ejs", {
    message: null,
    userInput: {}
  });
};
