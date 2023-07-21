const express = require('express');
const bookingController = require('./../routeHandlers/bookingController');
const authController = require('./../routeHandlers/authController');
const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authController.protectedRoute,
  bookingController.getCheckoutSession
);

module.exports = router;
