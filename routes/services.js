const router = require('express').Router();
const ctrl   = require('../controllers/servicesController');

router.get('/', ctrl.getServices);

module.exports = router;
