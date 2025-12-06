const mongoose = require("mongoose");
const Cart = require("../models/cart.model");

module.exports = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (!req.user || !userId) {
      // Create a "Dummy" cart so EJS doesn't crash on "cart.calculation"
      res.locals.cart = {
        items: [],
        calculation: { subtotal: 0, cartCount: 0, shipping: 0, discount: 0, total: 0 }
      };
      return next();
    }

    // 2. Fetch Cart
    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("coupon");

    // 3. Handle Empty Cart from DB
    if (!cart) {
      res.locals.cart = {
        items: [],
        calculation: { subtotal: 0, cartCount: 0, shipping: 0, discount: 0, total: 0 }
      };
      return next();
    }

    // 4. Filter "Ghost" Items (Products deleted from DB but still in Cart)
    // This prevents EJS from crashing when accessing "item.productId.name"
    cart.items = cart.items.filter(item => item.productId != null);

    // -----------------------------
    //    CALCULATE NUMBERS
    // -----------------------------
    let subtotal = 0;
    let count = 0;
    
    cart.items.forEach(item => {
        subtotal += item.productId.price * item.quantity;
        count += item.quantity;
    });

    // Shipping Rule: 100 if items exist, else 0
    const shipping = cart.items.length > 0 ? 100 : 0;

    // Coupon Logic
    let discount = 0;
    if (cart.coupon && cart.items.length > 0) {
      const c = cart.coupon;
      // Simple date check
      if (c.isActive && new Date() < c.expiresAt) {
         if (c.discountType === 'percentage') {
             discount = (subtotal * c.discountValue) / 100;
         } else if (c.discountType === 'fixed') {
             discount = c.discountValue;
         }
         // Prevent negative total
         if (discount > subtotal) discount = subtotal;
      }
    }

    const total = subtotal + shipping - discount;

    // 5. Expose structure EXACTLY as EJS expects it
    res.locals.cart = {
      _id: cart._id,
      items: cart.items, // The filtered list
      coupon: cart.coupon,
      calculation: {
        subtotal: subtotal,
        cartCount: count,
        shipping: shipping,
        discount: discount,
        total: total
      }
    };

    next();

  } catch (err) {
    console.error("Cart Middleware Error:", err);
    // Fallback on error to prevent white screen
    res.locals.cart = {
        items: [],
        calculation: { subtotal: 0, cartCount: 0, shipping: 0, discount: 0, total: 0 }
    };
    next();
  }
};