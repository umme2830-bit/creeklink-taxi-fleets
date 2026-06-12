const router = require('express').Router();
const ctrl   = require('../controllers/contactController');

router.get('/',  ctrl.getContact);
router.post('/', ctrl.postContact);

module.exports = router;
