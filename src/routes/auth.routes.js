const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const validate = require('../middlewares/validationResult.middleware');
const { registerRules, loginRules } = require('../validations/user.validator');

router.post('/register',registerRules, validate('auth/register'), authController.register);
router.post('/login',loginRules, validate('auth/login'), authController.login);
router.get('/logout', authController.logout);

module.exports = router;