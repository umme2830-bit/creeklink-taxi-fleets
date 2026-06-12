const Booking    = require('../models/Booking');
const nodemailer = require('nodemailer');

exports.getBook = (req, res) => {
  res.render('book', { title: 'Book a Ride — CreekLink', success: false, error: null });
};

exports.postBook = async (req, res) => {
  try {
    const { fullName, phone, email, pickup, dropoff, date, time, serviceType } = req.body;

    let saved = false;
    try {
      const booking = new Booking({ fullName, phone, email, pickup, dropoff, date, time, serviceType });
      await booking.save();
      saved = true;
    } catch (dbErr) {
      console.warn('DB unavailable — booking not persisted:', dbErr.message);
    }

    // Email stub
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'CreekLink — Booking Confirmation',
          text: `Hi ${fullName},\n\nYour booking from ${pickup} to ${dropoff} on ${date} at ${time} has been received.\n\nThe CreekLink Team`,
        });
      } else {
        console.log('[EMAIL STUB] Booking confirmation →', { fullName, email, pickup, dropoff, date, time });
      }
    } catch (mailErr) {
      console.warn('Email not sent:', mailErr.message);
    }

    res.render('book', { title: 'Book a Ride — CreekLink', success: true, error: null });
  } catch (err) {
    console.error(err);
    res.render('book', { title: 'Book a Ride — CreekLink', success: false, error: 'Something went wrong. Please try again.' });
  }
};
