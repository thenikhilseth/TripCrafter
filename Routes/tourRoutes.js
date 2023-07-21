const express = require('express');
const authController = require('./../routeHandlers/authController');
const reviewController = require('./../routeHandlers/reviewController');
const reviewRouter = require('./reviewRoutes');
const {
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
  getMonthlyPlan,
  aliasTopTours,
  getTourStatus
} = require('./../routeHandlers/tourController');
//Another way of writing the functions we imported

//Creating Router
const router = express.Router();

// router.param('id');

router.route('/five-cheapest-tours').get(aliasTopTours, getAllTours);
router.route('/get-tour-status').get(getTourStatus);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protectedRoute,
    authController.permission('admin', 'lead-guide'),
    createTour
  );

router
  .route('/:id')
  .get(getOneTour)
  .patch(
    authController.protectedRoute,
    authController.permission('admin', 'lead-guide'),
    updateTour
  )
  .delete(
    authController.protectedRoute,
    authController.permission('admin', 'lead-guide'),
    deleteTour
  );

router
  .route('/monthly-plan/:year')
  .get(
    authController.protectedRoute,
    authController.permission('admin', 'lead-guide'),
    getMonthlyPlan
  );
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protectedRoute,
//     authController.permission('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); //router is also a middleware, so we can use use method on router.
//like we did app.use(url, router) in app file.

module.exports = router;
