const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require('../middlewares/adminOnly.middleware');
const loadCart = require('../middlewares/loadCart.middleware'); // Need this!

// GET Checkout Page (New)
// Note: We need loadCart here so the summary table works
router.get("/checkout", auth, loadCart, orderCtrl.getCheckoutPage);

// 1. User Routes
router.post("/create", auth, orderCtrl.createOrder); // Triggered by "Checkout" button
router.get("/my", auth, orderCtrl.getMyOrders);      // View History

// 2. Admin Routes (API)
router.get("/", auth, adminOnly, orderCtrl.getAllOrders);
router.patch("/:id", auth, adminOnly, orderCtrl.updateOrderStatus);
router.delete("/:id", auth, adminOnly, orderCtrl.deleteOrder);

module.exports = router;