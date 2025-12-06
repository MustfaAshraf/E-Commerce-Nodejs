const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');

router.get('/', shopController.getHome);
router.get('/login', shopController.getLogin);
router.get('/register', shopController.getRegister);
router.get('/bestseller', shopController.getBestSeller);
router.get('/checkout', shopController.getCheckout);

module.exports = router;