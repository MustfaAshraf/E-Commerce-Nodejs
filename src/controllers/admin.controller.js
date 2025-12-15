const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/users.model');
const Message = require('../models/message.model');

exports.getDashboard = async (req, res) => {
  try {
    const isVendor = req.user.role === 'owner';
    const userId = req.user.id;

    // Initialize Variables
    let productCount = 0;
    let orderCount = 0; // Or "Items Sold" for vendor
    let userCount = 0;
    let totalRevenue = 0;
    let recentData = []; // Orders for Admin, Products for Vendor

    // ====================================================
    // 🅰️ VENDOR LOGIC (Owner)
    // ====================================================
    if (isVendor) {
        // 1. Get ONLY my products
        const myProducts = await Product.find({ owner: userId });
        
        productCount = myProducts.length;

        // 2. Calculate Revenue & Sales from MY products only
        // Revenue = Sum of (Price * Sold Count)
        // Orders = Sum of Sold Count
        myProducts.forEach(p => {
            totalRevenue += (p.price * (p.sold || 0));
            orderCount += (p.sold || 0);
        });

        // 3. Recent Activity: Top selling products
        recentData = myProducts.sort((a, b) => b.sold - a.sold).slice(0, 5);
    } 
    
    // ====================================================
    // 🅱️ ADMIN LOGIC
    // ====================================================
    else {
        // 1. Counts
        productCount = await Product.countDocuments();
        orderCount = await Order.countDocuments(); // Total actual orders
        userCount = await User.countDocuments({ role: 'user' });

        // 2. Calculate Total Revenue from ORDERS collection
        const allOrders = await Order.find();
        
        // Sum up the 'totalPrice' of every order
        totalRevenue = allOrders.reduce((sum, order) => {
            return sum + (order.totalPrice || 0);
        }, 0);

        // 3. Recent Activity: Recent Orders
        recentData = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name');
    }

    // ====================================================
    // 📊 CHART DATA GENERATION
    // ====================================================
    let chartLabels = [];
    let chartData = [];

    if (!isVendor) {
        // Admin: Reverse to show oldest -> newest
        // We filter out orders with no date/price just in case
        const ordersForChart = [...recentData].reverse(); 
        
        chartLabels = ordersForChart.map(o => new Date(o.createdAt).toLocaleDateString());
        chartData = ordersForChart.map(o => o.totalPrice || 0);
    } else {
        // Vendor: Top products
        chartLabels = recentData.map(p => p.name.substring(0, 10) + '...');
        chartData = recentData.map(p => p.sold || 0);
    }

    // DEBUG: Print this to your VS Code terminal to prove data exists!
    console.log("CHART LABELS:", chartLabels);
    console.log("CHART DATA:", chartData);

    // ====================================================
    // 🏁 RENDER VIEW
    // ====================================================
    res.render('admin/dashboard', {
        pageTitle: 'Dashboard',
        isVendor: isVendor,
        stats: {
            products: productCount,
            orders: orderCount,
            users: userCount,
            revenue: totalRevenue.toFixed(2)
        },
        recentOrders: recentData,
        
        // 🚨 FIX: Stringify HERE so EJS doesn't get confused
        chart: {
            labels: JSON.stringify(chartLabels), 
            data: JSON.stringify(chartData)
        }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).render('error', { message: 'Dashboard Error' });
  }
};

// GET: Admin Product List
exports.getProducts = async (req, res) => {
  try {
    let query = {};

    // 1. ISOLATION LOGIC
    // If user is a Vendor ('owner'), only show THEIR products
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    }
    // If 'admin', query remains {} (Show all)

    // 2. Fetch Products
    const products = await Product.find(query)
        .populate('category')
        .populate('owner', 'name') // Optional: Show who owns the product
        .sort({ createdAt: -1 });

    res.render('admin/products', {
        pageTitle: 'Manage Products',
        products: products,
        user: req.user // Pass user to view to hide/show Admin columns
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load products' });
  }
};

// ... existing imports ...

// GET: List all Orders
// GET: List all Orders
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    
    // 1. Safe User ID extraction
    const userId = req.user.id || req.user._id;

    // 2. Vendor Logic
    if (req.user.role === 'owner') {
        // Step A: Find all products that belong to this Vendor
        const myProducts = await Product.find({ owner: userId }).select('_id');
        
        // Extract just the IDs
        const myProductIds = myProducts.map(p => p._id);

        console.log(`--- DEBUG ORDERS ---`);
        console.log(`Vendor ID: ${userId}`);
        console.log(`Found ${myProductIds.length} products owned by this vendor.`);

        if (myProductIds.length === 0) {
            // If vendor has no products, they can't have any orders
            // We set a query that returns nothing
            query = { _id: null }; 
        } else {
            // Step B: Find Orders where 'items.productId' matches ANY of my product IDs
            query = { "items.productId": { $in: myProductIds } };
        }
    }

    // 3. Execute Query
    const orders = await Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for this user.`);

    res.render('admin/orders', {
        pageTitle: 'Manage Orders',
        orders: orders,
        user: req.user
    });

  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).render('error', { message: 'Failed to load orders' });
  }
};

// GET: Single Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.productId'); // Get product details (image, name)

    if (!order) {
        return res.status(404).render('error', { message: 'Order not found' });
    }

    res.render('admin/order-details', {
        pageTitle: `Order #${order._id.toString().slice(-6)}`,
        order: order,
        user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load order details' });
  }
};

// POST: Update Status (e.g., Pending -> Shipped)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        await Order.findByIdAndUpdate(id, { status: status });
        
        // Redirect back to the details page
        res.redirect(`/dashboard/orders/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to update status' });
    }
};

// GET: List Users
exports.getUsers = async (req, res) => {
  try {
    // Only Admins/Owners should see this (handled by middleware)
    const users = await User.find().sort({ createdAt: -1 });

    res.render('admin/users', {
        pageTitle: 'Manage Users',
        users: users,
        currentUser: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load users' });
  }
};

// OPTIONAL: Delete User
exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const targetUser = await User.findById(id);

        if (!targetUser) return res.redirect('/dashboard/users');

        // Security: Prevent deleting Owners or Self
        if (targetUser.role === 'owner') {
            return res.redirect('/dashboard/users?error=CannotDeleteOwner');
        }
        if (targetUser.id.toString() === req.user.id.toString()) {
            return res.redirect('/dashboard/users?error=CannotDeleteSelf');
        }

        await User.findByIdAndDelete(id);
        res.redirect('/dashboard/users');
    } catch(err) {
      console.log(err);
      res.redirect('/dashboard/users?error=Fail');
    }
};

exports.getMessages = async (req, res) => {
    try {
        // Fetch messages, newest first
        const messages = await Message.find().sort({ createdAt: -1 });

        res.render('admin/messages', {
            pageTitle: 'Support Messages',
            messages: messages,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load messages' });
    }
};

// POST: Toggle "Read" Status
exports.toggleMessageRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (message) {
            message.isRead = !message.isRead; // Flip true/false
            await message.save();
        }
        res.redirect('/dashboard/messages');
    } catch (err) {
        res.redirect('/dashboard/messages');
    }
};

// POST: Delete Message
exports.deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard/messages');
    } catch (err) {
        res.redirect('/dashboard/messages?error=DeleteFailed');
    }
};