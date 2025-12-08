const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const adminOrOwner  = require('../middlewares/adminOrOwner.middleware');
const userUpload = require('../middlewares/userUpload.middleware'); // Import new middleware

// Update the POST route
router.get('/profile', auth, userCtrl.getProfile);
router.post('/profile', auth, userUpload.single('avatar'), userCtrl.updateProfile);
router.get('/',auth ,adminOrOwner('error'), userCtrl.getAllUsers);
router.get('/:id',auth ,adminOrOwner('error'), userCtrl.getUser);
router.post('/',auth ,adminOrOwner('error'), userCtrl.createUser);
router.patch('/:id',auth ,adminOrOwner('error'), userCtrl.updateUser);
router.delete('/:id',auth ,adminOrOwner('error'), userCtrl.deleteUser);

module.exports = router;
