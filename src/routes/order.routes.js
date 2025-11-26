const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require('../middlewares/adminOnly.middleware');

// create order from cart
router.post("/", auth, orderCtrl.createOrder);

// admin: get all orders
router.get("/", auth, adminOnly, orderCtrl.getAllOrders);

// user: get own orders
router.get("/my", auth, orderCtrl.getMyOrders);

// admin: update order
router.patch("/:id", auth, adminOnly, orderCtrl.updateOrderStatus);

// admin: delete order
router.delete("/:id", auth, adminOnly, orderCtrl.deleteOrder);

module.exports = router;
