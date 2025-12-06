const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const adminOnly  = require('../middlewares/adminOnly.middleware');
const userUpload = require('../middlewares/userUpload.middleware'); // Import new middleware

// Update the POST route
router.get('/profile', auth, userCtrl.getProfile);
router.post('/profile', auth, userUpload.single('avatar'), userCtrl.updateProfile);
router.get('/',auth ,adminOnly, userCtrl.getAllUsers);
router.get('/:id',auth ,adminOnly, userCtrl.getUser);
router.post('/',auth ,adminOnly, userCtrl.createUser);
router.patch('/:id',auth ,adminOnly, userCtrl.updateUser);
router.delete('/:id',auth ,adminOnly, userCtrl.deleteUser);

module.exports = router;
