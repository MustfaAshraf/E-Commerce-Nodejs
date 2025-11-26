const router = require("express").Router();
const couponCtrl = require("../controllers/coupon.controller");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require('../middlewares/adminOnly.middleware');

router.get("/",auth, adminOnly, couponCtrl.getAllCoupons);
router.post("/add",auth, adminOnly, couponCtrl.createCoupon);
router.patch("/:id",auth, adminOnly, couponCtrl.updateCoupon);
router.delete("/:id",auth, adminOnly, couponCtrl.deleteCoupon);

module.exports = router;
