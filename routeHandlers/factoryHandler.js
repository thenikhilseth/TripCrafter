const catchAsync = require('./../Util/catchAsync');
const AppError = require('./../Util/appError');

exports.deleteOne = Model => {
  return catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that Id ', 404));
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};

exports.updateOne = Model => {
  return catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return next(new AppError('No document found with that Id', 404));

    res.status(201).json({
      result: 'success',
      data: {
        doc
      }
    });
  });
};

exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(202).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({
      result: 'success',
      data: {
        data: doc
      }
    });
  });
};
