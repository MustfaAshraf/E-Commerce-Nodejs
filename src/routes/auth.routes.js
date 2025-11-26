const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const validate = require('../middlewares/validationResult.middleware');
const { registerRules, loginRules } = require('../validations/user.validator');

router.post('/register',registerRules, validate, authController.register);
router.post('/login',loginRules, validate, authController.login);
router.get('/logout', authController.logout);

module.exports = router;