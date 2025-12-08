const router = require('express').Router();
const contactCtrl = require('../controllers/message.controller');

// We allow guests to contact us, so no strict auth middleware needed on GET
// But we might check user session to pre-fill inputs
router.get('/', contactCtrl.getContactPage);
router.post('/', contactCtrl.submitContact);

module.exports = router;