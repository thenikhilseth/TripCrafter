const Tour = require('./../Models/tourModels');
const APIFeatures = require('./../Util/APIFeatures');
const catchAsync = require('./../Util/catchAsync');
const factory = require('./factoryHandler');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price -ratingsAverage';
  req.query.fields = 'name price ratingAverage difficulty summary';
  next();
};

//2)  Tour Route Handlers
exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paginate();

  const tours = await features.query;

  //6 Sending the result
  res.status(200).json({
    result: 'success',
    requestedAt: req.requestTime,
    length: tours.length,
    data: {
      tours: tours
    }
  });
  // }) catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

//3) Get one tour
// exports.getOneTour = async (req, res) => {
//   try {
//     const oneTour = await Tour.findById(req.params.id);
//     // findOne({_id:req.params.id})- Another way
//     res.status(200).json({
//       result: 'success',
//       data: {
//         tours: oneTour
//       }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err
//     });
//   }
// };

exports.getOneTour = factory.getOne(Tour, 'reviews');

//4) Create a new tour
// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body).populate('reviews);

//     res.status(201).json({
//       result: 'success',
//       data: {
//         newTour: newTour
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Invalid request',
//       Error: error
//     });
//   }
// };
exports.createTour = factory.createOne(Tour);

//4 Patch request (Updating Tour)
// exports.updateTour = async (req, res) => {
//   try {
//     const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     res.status(201).json({
//       result: 'success',
//       data: {
//         updatedTour: updatedTour
//       }
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid request',
//       Error: error
//     });
//   }
// };

exports.updateTour = factory.updateOne(Tour);

//5) Delete a tour
exports.deleteTour = factory.deleteOne(Tour);

//6
exports.getTourStatus = async (req, res) => {
  try {
    const tourStatus = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
    ]);
    res.status(200).json({
      result: 'success',
      data: {
        stats: tourStatus
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
