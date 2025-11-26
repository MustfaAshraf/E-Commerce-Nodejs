const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');      // adjust path/name if yours differs
const ownerOnly = require('../middlewares/ownerOnly.middleware'); // adjust path/name if yours differs
const upload = require('../middlewares/fileUpload.middleware');

const controller = require('../controllers/product.controller');

router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);

// admin
router.post('/', auth, ownerOnly, upload.single('image'), controller.createProduct);
router.patch('/:id', auth, ownerOnly, upload.single('image'), controller.updateProduct);
router.delete('/:id', auth, ownerOnly, controller.deleteProduct);

module.exports = router;