const Review = require('./../Models/reviewModel');
const catchAsync = require('./../Util/catchAsync');
const factory = require('./../routeHandlers/factoryHandler');

//1) Creating Reviews
exports.createReview = catchAsync(async (req, res, next) => {
  //Allow Nested routes to put the field inside the body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'successful',
    data: {
      newReview
    }
  });
});

//2) Getting Reviews

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; //if there is tour Id in url, get review of that tour only
  const allReview = await Review.find(filter);
  res.status(200).json({
    status: 'successful',
    result: allReview.length,
    data: {
      allReview
    }
  });
});

//3) Delete Review
exports.deleteReview = factory.deleteOne(Review);

//4) Update Review
exports.updateReview = factory.updateOne(Review);

//5) Get one Review
exports.getReview = factory.getOne(Review);
