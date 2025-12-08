const Coupon = require("../models/coupon.model");

// GET: Show Coupon Management Page
exports.getCouponsPage = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    res.render('admin/coupons', {
        pageTitle: 'Manage Coupons',
        coupons: coupons,
        user: req.user,
        error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: err.message });
  }
};

// POST: Create Coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiresAt } = req.body;

    // Default isActive to true if created via Dashboard
    await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      isActive: true
    });

    res.redirect('/dashboard/coupons');

  } catch (err) {
    // If Duplicate or Error, reload page with message
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    const errorMsg = err.code === 11000 ? 'Coupon code already exists' : err.message;

    res.render('admin/coupons', {
        pageTitle: 'Manage Coupons',
        coupons: coupons,
        user: req.user,
        error: errorMsg
    });
  }
};

// POST: Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard/coupons');
  } catch (err) {
    res.status(500).render('error', { message: "Failed to delete coupon" });
  }
};

// Toggle Status (Optional but cool: Activate/Deactivate)
exports.toggleStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if(coupon) {
            coupon.isActive = !coupon.isActive;
            await coupon.save();
        }
        res.redirect('/dashboard/coupons');
    } catch(err) {
        res.redirect('/dashboard/coupons');
    }
}