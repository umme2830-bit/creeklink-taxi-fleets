const Booking = require('../models/Booking');

const MOCK_BOOKINGS = [
  { _id: 'b001', fullName: 'James Harrington', pickup: 'Heathrow Terminal 5', dropoff: 'Mayfair, London', date: new Date('2024-07-10'), time: '09:00', serviceType: 'airport', status: 'confirmed' },
  { _id: 'b002', fullName: 'Sophie Clarke',    pickup: 'King\'s Cross Station',  dropoff: 'Canary Wharf',    date: new Date('2024-07-10'), time: '11:30', serviceType: 'business', status: 'pending' },
  { _id: 'b003', fullName: 'Aarav Patel',       pickup: 'Manchester Piccadilly', dropoff: 'Old Trafford',     date: new Date('2024-07-09'), time: '14:00', serviceType: 'economy', status: 'completed' },
  { _id: 'b004', fullName: 'Emily Thornton',    pickup: 'Birmingham New Street', dropoff: 'NEC Arena',        date: new Date('2024-07-09'), time: '17:45', serviceType: 'economy', status: 'confirmed' },
  { _id: 'b005', fullName: 'Liam O\'Brien',     pickup: 'Glasgow Central',       dropoff: 'Edinburgh Castle', date: new Date('2024-07-08'), time: '08:00', serviceType: 'business', status: 'completed' },
];

exports.getDashboard = async (req, res) => {
  let bookings = [];
  try {
    bookings = await Booking.find().sort({ createdAt: -1 }).limit(20);
  } catch (_) {
    bookings = MOCK_BOOKINGS;
  }
  if (!bookings.length) bookings = MOCK_BOOKINGS;

  res.render('dashboard', {
    title: 'Driver Dashboard — CreekLink',
    driver: req.driver,
    bookings,
  });
};
