const jwt    = require('jsonwebtoken');
const Driver = require('../models/Driver');

const MOCK_DRIVER = {
  _id: 'mock-001',
  name: 'Demo Driver',
  email: 'driver@creeklink.com',
  password: '$2a$12$KIXkm0HwNPmMz7R7VcXlUe', // not used in mock
};

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Driver Login — CreekLink', error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const secret = process.env.JWT_SECRET || 'creeklink_dev_secret';

  try {
    let driver = null;

    try {
      driver = await Driver.findOne({ email });
    } catch (_) {}

    // Mock fallback for demo
    if (!driver && email === 'driver@creeklink.com' && password === 'demo1234') {
      const token = jwt.sign({ id: 'mock-001', name: 'Demo Driver' }, secret, { expiresIn: '8h' });
      res.cookie('ck_token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
      return res.redirect('/dashboard');
    }

    if (!driver) {
      return res.render('login', { title: 'Driver Login — CreekLink', error: 'Invalid credentials.' });
    }

    const match = await driver.matchPassword(password);
    if (!match) {
      return res.render('login', { title: 'Driver Login — CreekLink', error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: driver._id, name: driver.name }, secret, { expiresIn: '8h' });
    res.cookie('ck_token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { title: 'Driver Login — CreekLink', error: 'Server error. Please try again.' });
  }
};

exports.getLogout = (req, res) => {
  res.clearCookie('ck_token');
  res.redirect('/login');
};
