const router = require('express').Router();
const ctrl   = require('../controllers/bookController');

router.get('/',  ctrl.getBook);
router.post('/', ctrl.postBook);

module.exports = router;
