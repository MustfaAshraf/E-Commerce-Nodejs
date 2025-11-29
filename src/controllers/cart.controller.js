const Cart = require("../models/cart.model");
const Coupon = require('../models/coupon.model');
const Product = require("../models/product.model");
const mongoose = require("mongoose");
const { matchedData } = require('express-validator');

exports.getCart = async (req, res) => {
  
  const cart = res.locals.cart;

  res.render("shop/cart", {
    pageTitle: 'My Cart',
    // If cart is null, send a dummy structure to prevent EJS errors
    cart: cart,
    couponStatus: req.query.coupon, // 'valid', 'invalid', 'error'
    message: null
  });
};

exports.addToCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const data = matchedData(req); 
    const productId = data.productId || req.body.productId;
    const quantity = parseInt(data.quantity || req.body.quantity || 1);

    // 2. Check Stock
    const product = await Product.findById(productId);
    if (!product) return res.redirect('/?error=ProductNotFound');

    // 3. Update Cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new
      if (quantity > product.quantity) return res.redirect('/products/' + productId + '?error=OutOfStock');
      
      await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });

    } else {
      // Update existing
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        const newQty = cart.items[itemIndex].quantity + quantity;
        if (newQty > product.quantity) return res.redirect('/products/' + productId + '?error=OutOfStock');
        
        cart.items[itemIndex].quantity = newQty;
      } else {
        if (quantity > product.quantity) return res.redirect('/products/' + productId + '?error=OutOfStock');
        
        cart.items.push({ productId, quantity });
      }
      
      await cart.save();
    }

    // 4. Redirect (Success)
    res.redirect('/my/cart');

  } catch (err) {
    console.error(err);
    res.redirect('/?error=AddToCartFailed');
  }
};

exports.increaseQuantity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.redirect("/my/cart");

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (item) {
      item.quantity += 1;
      await cart.save();
    }

    return res.redirect("/my/cart");
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};

exports.decreaseQuantity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.redirect("/my/cart");

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (item && item.quantity > 1) {
      item.quantity -= 1;
      await cart.save();
    }

    return res.redirect("/my/cart");
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // If no code is provided → remove coupon
    if (!code || code.trim() === "") {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.coupon = null;
        await cart.save();
      }
      return res.redirect("/my/cart");
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.trim() });

    // Validate coupon
    if (!coupon || !coupon.isActive || coupon.expiresAt < new Date()) {
      return res.redirect("/my/cart?coupon=invalid");
    }

    // Get user cart
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.redirect("/my/cart");

    // Attach coupon to cart
    cart.coupon = coupon._id;
    await cart.save();

    return res.redirect("/my/cart?coupon=valid");

  } catch (err) {
    console.error(err);
    return res.redirect("/my/cart?coupon=error");
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.redirect("/my/cart");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return res.redirect("/my/cart");
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
