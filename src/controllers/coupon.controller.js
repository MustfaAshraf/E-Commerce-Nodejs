const Coupon = require("../models/coupon.model");
const mongoose = require("mongoose");

// GET all coupons (list)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      data: { coupons },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// POST create coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiresAt, isActive } = req.body;

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      isActive: isActive
    });

    return res.status(201).json({
      status: "success",
      data: { coupon },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to create coupon");
  }
};

// POST update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const updates = {};

    // Code (optional)
    if (req.body.code !== undefined && req.body.code.trim() !== "") {
      updates.code = req.body.code.trim().toUpperCase();
    }

    // Discount Type (optional)
    if (req.body.discountType !== undefined) {
      updates.discountType = req.body.discountType;
    }

    // Discount Value (optional)
    if (req.body.discountValue !== undefined) {
      updates.discountValue = req.body.discountValue;
    }

    // Expires At (optional)
    if (req.body.expiresAt !== undefined && req.body.expiresAt !== "") {
      updates.expiresAt = new Date(req.body.expiresAt);
    }

    // isActive (optional)
    if (req.body.isActive !== undefined) {
      // handle checkbox OR boolean
      updates.isActive = req.body.isActive === "on" || req.body.isActive === true;
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        status: "fail",
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: { coupon },
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// DELETE coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        status: "fail",
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Coupon deleted",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
