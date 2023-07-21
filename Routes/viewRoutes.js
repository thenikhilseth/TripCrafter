const express = require('express');
const viewsController = require('../routeHandlers/viewsController');
const authController = require('../routeHandlers/authController');
const bookingController = require('../routeHandlers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get(
  '/tour/:nameInCapital',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protectedRoute, viewsController.getAccount);
router.get(
  '/my-tours',
  authController.protectedRoute,
  viewsController.getMyTours
);

module.exports = router;
