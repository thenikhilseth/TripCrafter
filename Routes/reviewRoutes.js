const express = require('express');
const authController = require('./../routeHandlers/authController');
const reviewController = require('./../routeHandlers/reviewController');
const router = express.Router({ mergeParams: true });

router.use(authController.protectedRoute); //Protected Route will apply to all the routes below this because it is a middleware only.

router
  .route('/')
  .post(authController.permission('user'), reviewController.createReview)
  .get(reviewController.getAllReviews);
//Only Users can post reviews, hense using permission middleware.

router
  .route('/:id')
  .delete(
    authController.permission('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.permission('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);

module.exports = router;
