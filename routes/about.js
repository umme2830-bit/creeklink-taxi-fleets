const router = require('express').Router();
const ctrl   = require('../controllers/aboutController');

router.get('/', ctrl.getAbout);

module.exports = router;
