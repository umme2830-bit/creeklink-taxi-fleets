const Contact    = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.getContact = (req, res) => {
  res.render('contact', { title: 'Contact — CreekLink', success: false, error: null });
};

exports.postContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    try {
      await new Contact({ name, email, phone, subject, message }).save();
    } catch (dbErr) {
      console.warn('DB unavailable:', dbErr.message);
    }

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `CreekLink Contact: ${subject}`,
          text: `From: ${name} <${email}>\nPhone: ${phone}\n\n${message}`,
        });
      } else {
        console.log('[EMAIL STUB] Contact form →', { name, email, subject });
      }
    } catch (mailErr) {
      console.warn('Email not sent:', mailErr.message);
    }

    res.render('contact', { title: 'Contact — CreekLink', success: true, error: null });
  } catch (err) {
    console.error(err);
    res.render('contact', { title: 'Contact — CreekLink', success: false, error: 'Something went wrong.' });
  }
};
