const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const adminOnly  = require('../middlewares/adminOnly.middleware');

router.get('/',auth ,adminOnly, userCtrl.getAllUsers);
router.get('/:id',auth ,adminOnly, userCtrl.getUser);
router.post('/',auth ,adminOnly, userCtrl.createUser);
router.patch('/:id',auth ,adminOnly, userCtrl.updateUser);
router.delete('/:id',auth ,adminOnly, userCtrl.deleteUser);

module.exports = router;
