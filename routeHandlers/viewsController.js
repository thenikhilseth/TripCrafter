const { contentSecurityPolicy } = require('helmet');
const Tour = require('./../Models/tourModels');
const Booking = require('./../Models/bookingModel');
const catchAsync = require('./../Util/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //1) Get Tour Data
  const tours = await Tour.find();
  //2) Build Template
  //3) Render template using tour data from 1) point.
  res.status(200).render('overview', {
    title: `${tours.name} Tour`,
    tours
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //1) Get tour, review and tour guides data
  const tour = await Tour.findOne({
    nameInCapital: req.params.nameInCapital
  }).populate({
    path: 'reviews', //path means document ki konsi field
    fields: 'review rating user'
  });
  //2) Build Template
  //3) Render Template using data from 1)
  res.status(200).render('tour', {
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      // "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js 'unsafe-inline' 'unsafe-eval';"
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'Log in to your account'
    });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.getMyTours = async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id }); //Fetch all the bokings of a user
  //2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour); //tourIDs is an array of all tours that are booked for a user
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
};
