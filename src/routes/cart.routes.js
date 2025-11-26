const router = require("express").Router();
const cartCtrl = require("../controllers/cart.controller");
const auth = require("../middlewares/auth.middleware");
const loadCart = require('../middlewares/loadCart.middleware');

router.get("/", auth, loadCart, cartCtrl.getCart);
router.post("/add", auth, cartCtrl.addToCart);
router.post("/apply-coupon", auth, cartCtrl.applyCoupon);
router.post("/increase/:productId", auth, cartCtrl.increaseQuantity);
router.post("/decrease/:productId", auth, cartCtrl.decreaseQuantity);
router.post("/remove/:productId", auth, cartCtrl.removeFromCart);

module.exports = router;
