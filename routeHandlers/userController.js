const User = require('../Models/userModels');
const catchAsync = require('../Util/catchAsync');
const AppError = require('./../Util/appError');
const authController = require('./authController');
const factory = require('./factoryHandler');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    result: 'Success',
    data: {
      users
    }
  });
});
//Create USER (We don't need it because we already have a SIGNUP FUNCTION)
exports.createUser = catchAsync(async (req, res, next) => {
  res.status(202).json({
    status: 'Error',
    message: 'Please use /signUp instead'
  });
});

//Get one user details
exports.getUser = factory.getOne(User);

//Don't use these to update passwords.
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

const filterData = (body, ...allowedFields) => {
  const newObj = new Object();
  Object.keys(body).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = body[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create Error if User posts Password data because in this controller, we are not dealing with Passwords.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        ' This route is not for password updates, please use /updatePassword'
      ),
      500
    );
  }
  //2) Update User Document- name and email address for now, but we can add as many as we want.

  const data = filterData(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'successful',
    updatedUser: updatedUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'successful',
    data: null
  });
});
