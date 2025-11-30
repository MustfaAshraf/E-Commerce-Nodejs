const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/users.model");
const mongoose = require('mongoose');

// 1️⃣ CREATE ORDER (The Complex Logic)
exports.createOrder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId })
        .populate("items.productId")
        .populate("coupon");

    if (!cart || !cart.items.length) {
      return res.redirect('/my/cart');
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const product = item.productId;

        // Security: Check if product still exists
        if (!product) continue; 
        
        // Security: Check Stock Level
        if (product.quantity < item.quantity) {
            return res.redirect(`/my/cart?error=OutOfStock&product=${product.name}`);
        }

        // Add to Order Array
        orderItems.push({
            productId: product._id,
            name: product.name, // Save snapshot of name
            quantity: item.quantity,
            priceAtPurchase: product.price
        });

        subtotal += product.price * item.quantity;
    }

    const shippingCost = 100; // Static shipping
    let discount = 0;

    // Re-verify coupon logic (Never trust frontend math)
    if (cart.coupon && cart.coupon.isActive && new Date() < cart.coupon.expiresAt) {
        if (cart.coupon.discountType === 'percentage') {
            discount = (subtotal * cart.coupon.discountValue) / 100;
        } else {
            discount = cart.coupon.discountValue;
        }
        // Cap discount at subtotal (can't be negative)
        if (discount > subtotal) discount = subtotal;
    }

    const totalPrice = subtotal + shippingCost - discount;

    // -----------------------------------------------------
    // D. PREPARE SHIPPING ADDRESS
    // -----------------------------------------------------
    // Priority 1: Address from Checkout Form (req.body.address)
    // Priority 2: Address from User Profile (Fallback)
    
    let shippingAddress = req.body.address; 

    // If form didn't send address (e.g. unexpected API call), fetch from User
    if (!shippingAddress || !shippingAddress.street) {
        const user = await User.findById(userId);
        shippingAddress = user.address;
    }

    // -----------------------------------------------------
    // E. DB TRANSACTION: CREATE ORDER & UPDATE STOCK
    // -----------------------------------------------------
    
    // 1. Create the Order
    await Order.create({
        userId,
        items: orderItems,
        shippingAddress: shippingAddress, 
        subtotal,
        shippingCost,
        discount,
        totalPrice,
        status: 'pending',
        paymentMethod: req.body.paymentMethod || 'COD' // Default to Cash on Delivery
    });

    // 2. Deduct Stock from Products
    // We loop through items and decrement the quantity
    const stockUpdates = orderItems.map(item => {
        return Product.findByIdAndUpdate(item.productId, {
            $inc: { quantity: -item.quantity } 
        });
    });
    await Promise.all(stockUpdates);

    // 3. Clear the User's Cart
    await Cart.findOneAndDelete({ userId });

    // -----------------------------------------------------
    // F. SUCCESS REDIRECT
    // -----------------------------------------------------
    // Redirect to the "My Orders" list so they can see their new order
    return res.redirect('/orders/my');

  } catch (err) {
    console.error("Create Order Error:", err);
    // If something breaks, send them back to cart with a generic error
    return res.redirect('/my/cart?error=OrderFailed');
  }
};

exports.getCheckoutPage = async (req, res) => {
    try {
        const cart = res.locals.cart; // Already loaded by middleware
        
        // If empty cart, kick them out
        if (!cart || cart.items.length === 0) {
            return res.redirect('/my/cart');
        }

        res.render('shop/checkout', {
            pageTitle: 'Checkout',
            user: req.user, // To pre-fill inputs
            cart: cart
        });
    } catch (err) {
        console.error(err);
        res.redirect('/my/cart');
    }
};

// 2️⃣ GET USER’S ORDERS (MVC View)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const orders = await Order.find({ userId })
        .sort({ createdAt: -1 }); // Newest first

    res.render('orders/index', {
        pageTitle: 'My Orders',
        orders: orders
    });

  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Failed to load orders' });
  }
};

// 3️⃣ ADMIN: GET ALL ORDERS (JSON API)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      status: "success", 
      data: { 
        orders 
      } 
    });
  } catch (err) {
    return res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// 4️⃣ ADMIN: UPDATE STATUS (JSON API)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ 
      status: "success", 
      data: { 
        order 
      } 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 5️⃣ ADMIN: DELETE ORDER (JSON API)
exports.deleteOrder = async (req, res) => {
  try {
    // Optional: If you delete an order, do you want to restock items?
    // For now, let's just delete the record.
    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({ 
      status: "success", 
      message: "Order deleted" 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};