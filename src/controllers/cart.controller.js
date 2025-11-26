const Cart = require("../models/cart.model");
const Coupon = require('../models/coupon.model');
const Product = require("../models/product.model");
const mongoose = require("mongoose");

exports.getCart = async (req, res) => {
  try {
    const cart = res.locals.cart;
    return res.render("shop/cart.ejs", {
      cart: cart || { items: [] },
      couponStatus: req.query.coupon
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);;
    const { productId, quantity = 1 } = req.body;

    // validate product id
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "fail",
        data: { message: "Invalid product id" }
      });
    }

    // ensure product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        status: "fail",
        data: { message: "Product not found" }
      });
    }

    // find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
      // check if product already exists in cart
      const index = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (index >= 0) {
        cart.items[index].quantity += Number(quantity);
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    return res.status(200).json({
      status: "success",
      data: { cart }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
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
