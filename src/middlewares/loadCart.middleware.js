const mongoose = require("mongoose");
const Cart = require("../models/cart.model");

module.exports = async (req, res, next) => {
  try {
    // If user is not logged in, skip silently
    if (!req.user || !req.user.id) {
      res.locals.cart = null;
      return next();
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("coupon"); // populate coupon object too

    if (!cart) {
      res.locals.cart = null;
      return next();
    }

    // -----------------------------
    //    PRICE CALCULATIONS
    // -----------------------------

    // 1) SUBTOTAL
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.productId) {
        subtotal += item.productId.price * item.quantity;
      }
    }

    // 2) SHIPPING (static for now)
    const shipping = 100;

    // 3) COUPON DISCOUNT
    let discount = 0;

    if (cart.coupon) {
      const c = cart.coupon;

      const expired = c.expiresAt < new Date();
      const inactive = !c.isActive;

      if (!expired && !inactive) {
        if (c.discountType === "percentage") {
          discount = (subtotal * c.discountValue) / 100;
        } else if (c.discountType === "fixed") {
          discount = c.discountValue;
        }

        // avoid negative totals
        if (discount > subtotal) discount = subtotal;
      }
    }
    // 4) TOTAL
    const total = subtotal - discount + shipping;

    // Expose everything to EJS
    res.locals.cart = {
      ...cart.toObject(),
      calculation: {
        subtotal,
        shipping,
        discount,
        total
      }
    };

    return next();

  } catch (err) {

    res.locals.cart = null;
    // JSend for API endpoints only
      return res.status(500).json({
        status: "error",
        data: { error: err.message }
      });

  }
};
