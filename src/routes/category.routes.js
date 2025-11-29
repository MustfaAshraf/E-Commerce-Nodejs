const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/adminOnly.middleware');
const validateJson = require('../middlewares/validateJSON.middleware'); 
const { categoryRules } = require('../validations/category.validator');

// 1. Get All
router.get('/', controller.getCategories);

// 2. Create
router.post('/', 
    auth, 
    adminOnly, 
    categoryRules, 
    validateJson, 
    controller.createCategory
);

// 3. Update (Added)
router.patch('/:id', 
    auth, 
    adminOnly, 
    categoryRules, // Validate the new name
    validateJson, 
    controller.updateCategory
);

// 4. Delete
router.delete('/:id', 
    auth, 
    adminOnly, 
    controller.deleteCategory
);

module.exports = router;