const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');

router.get('/', shopController.getHome);
router.get('/login', shopController.getLogin);
router.get('/register', shopController.getRegister);
router.get('/shop', shopController.getShop);
router.get('/product/:id', shopController.getSingleProduct);
router.get('/bestseller', shopController.getBestSeller);
router.get('/checkout', shopController.getCheckout);
router.get('/contact', shopController.getContact);

module.exports = router;