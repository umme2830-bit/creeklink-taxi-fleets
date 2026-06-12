const router = require('express').Router();
const ctrl   = require('../controllers/authController');

router.get('/login',  ctrl.getLogin);
router.post('/login', ctrl.postLogin);
router.get('/logout', ctrl.getLogout);

module.exports = router;
