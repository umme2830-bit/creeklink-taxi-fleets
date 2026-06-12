const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.ck_token;
  if (!token) return res.redirect('/login');

  try {
    const secret = process.env.JWT_SECRET || 'creeklink_dev_secret';
    req.driver = jwt.verify(token, secret);
    next();
  } catch (_) {
    res.clearCookie('ck_token');
    res.redirect('/login');
  }
};
