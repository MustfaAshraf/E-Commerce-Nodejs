const express = require('express');
const router = express.Router();

// 1. Import Controllers & Middlewares
const controller = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const adminOrOwner = require('../middlewares/adminOrOwner.middleware'); 
const upload = require('../middlewares/fileUpload.middleware');
const validate = require('../middlewares/validationResult.middleware');
const { productRules } = require('../validations/product.validator');


router.get('/add', auth, adminOrOwner('error'), controller.getAddProductPage);

// POST: Process the form
router.post('/add', 
    auth, 
    adminOrOwner('error'), 
    upload.single('image'),           // 1. Upload File
    productRules,                     // 2. Check Rules (Joi/Express-Validator)
    validate('products/add-product'), // 3. If Error: Delete file & Render Form
    controller.createProduct          // 4. Success: Save to DB
);

// 2. Edit Product
router.get('/edit/:id', auth, adminOrOwner('error'), controller.getEditProductPage);

// POST: Update the data (Using POST because HTML Forms don't support PATCH natively)
router.post('/edit/:id', 
    auth, 
    adminOrOwner('error'), 
    upload.single('image'), 
    productRules, 
    validate('products/add-product'), // Re-use the same view for errors
    controller.updateProduct
);

// 3. Delete Product
router.post('/delete/:id', auth, adminOrOwner('error'), controller.deleteProduct);

router.get('/', controller.getProducts);

router.get('/:id', controller.getProduct);


module.exports = router;