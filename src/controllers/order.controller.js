const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models//product.model");
const mongoose = require("mongoose");

//
// 1️⃣ CREATE ORDER (from cart + clear cart)
//
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has a cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        status: "fail",
        message: "Cart is empty"
      });
    }

    // Build order items array
    const items = cart.items.map(i => ({
      productId: i.productId._id,
      quantity: i.quantity,
      priceAtPurchase: i.productId.price,
    }));

    // Calculate total
    const totalPrice = items.reduce(
      (sum, i) => sum + i.quantity * i.priceAtPurchase,
      0
    );

    // Create new order
    const order = await Order.create({
      userId,
      items,
      totalPrice,
      status: "pending",
    });

    // Clear the cart
    await Cart.findOneAndUpdate(
      { userId },
      { items: [] }
    );

    return res.status(201).json({
      status: "success",
      data: { order },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


//
// 2️⃣ GET ALL ORDERS (ADMIN ONLY)
//
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId");

    return res.status(200).json({
      status: "success",
      data: { orders }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


//
// 3️⃣ GET USER’S OWN ORDERS
//
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("items.productId");

    return res.status(200).json({
      status: "success",
      data: { orders }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


//
// 4️⃣ UPDATE ORDER STATUS (ADMIN ONLY)
//
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status value"
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: { order }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


//
// 5️⃣ DELETE ORDER (ADMIN ONLY)
//
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order deleted"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
