const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controller');
const categoryCtrl = require('../controllers/category.controller');
const couponCtrl = require('../controllers/coupon.controller');
const auth = require('../middlewares/auth.middleware');
const adminOrOwner = require('../middlewares/adminOrOwner.middleware');
const strictAdmin = require('../middlewares/strictAdmin.middleware');

// Apply Global Admin Protection to all routes in this file
// (Any route below this line requires Login + Admin Role)
router.use(auth, adminOrOwner('error'));

// Dashboard Home
router.get('/', adminCtrl.getDashboard);
router.get('/products', adminCtrl.getProducts);
router.get('/orders', adminCtrl.getOrders);
router.get('/orders/:id', adminCtrl.getOrderDetails);
router.post('/orders/:id/status', adminCtrl.updateOrderStatus);
// 📦 CATEGORY ROUTES
router.get('/categories', strictAdmin, categoryCtrl.getAdminCategories);
router.post('/categories', strictAdmin, categoryCtrl.createCategory);
router.post('/categories/delete/:id', strictAdmin, categoryCtrl.deleteCategory);
router.get('/categories/edit/:id', strictAdmin, categoryCtrl.getEditCategoryPage);
router.post('/categories/edit/:id', strictAdmin, categoryCtrl.updateCategory);
// 👥 USER ROUTES
router.get('/users', strictAdmin, adminCtrl.getUsers);
router.post('/users/delete/:id', strictAdmin, adminCtrl.deleteUser);
// 🎟️ COUPON ROUTES (Strict Admin Only)
router.get('/coupons', strictAdmin, couponCtrl.getCouponsPage);
router.post('/coupons', strictAdmin, couponCtrl.createCoupon);
router.post('/coupons/delete/:id', strictAdmin, couponCtrl.deleteCoupon);
router.post('/coupons/toggle/:id', strictAdmin, couponCtrl.toggleStatus);

module.exports = router;