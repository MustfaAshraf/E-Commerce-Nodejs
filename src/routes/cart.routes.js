const router = require("express").Router();
const cartCtrl = require("../controllers/cart.controller");
const auth = require("../middlewares/auth.middleware");
const loadCart = require('../middlewares/loadCart.middleware');
const { cartRules } = require('../validations/cart.validator');

router.get("/", auth, loadCart, cartCtrl.getCart);
router.post("/add", auth, cartRules, cartCtrl.addToCart);
router.post("/increase/:productId", auth, cartCtrl.increaseQuantity);
router.post("/decrease/:productId", auth, cartCtrl.decreaseQuantity);
router.post("/remove/:productId", auth, cartCtrl.removeFromCart);
router.post("/apply-coupon", auth, cartCtrl.applyCoupon);

module.exports = router;