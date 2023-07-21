const User = require('../Models/userModels');
const catchAsync = require('../Util/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../Util/appError');
const { promisify } = require('util');
const Email = require('./../Util/email');
const crypto = require('crypto');

const token = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

const sendToken = (newUser, statusCode, res) => {
  const newToken = token(newUser._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', newToken, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    newToken,
    data: {
      user: newUser
    }
  });
};

////////////////USER SIGNUP///////////////////////////////////

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  }); //or User.save(req.body)
  url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  sendToken(newUser, 202, res);
});

////////  USER LOGIN ////////////////////////////

exports.login = catchAsync(async (req, res, next) => {
  //1) If email or password field is empty
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide your email and password', 400));
  }

  //2) Check if Email or Password is correct, //If email or password is wrong, send error message.

  const existingUser = await User.findOne({ email }).select('+password'); //Because we unselect password in user model schema, so we again select it here to use it.
  if (
    !existingUser ||
    !(await existingUser.correctPassword(password, existingUser.password))
  ) {
    return next(new AppError('Please provide correct email or password', 401));
  } else {
    console.log(existingUser.email, existingUser.password);
    sendToken(existingUser, 202, res);
  }
  // next()
});

///// PROTECTED ROUTES ////////////

exports.protectedRoute = catchAsync(async (req, res, next) => {
  //1) Check if Token is available in header or not
  let token = null;
  // console.log(req.headers);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token === null) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  //2) Verify Token

  const verify = promisify(jwt.verify);

  try {
    payload = await verify(token, process.env.JWT_SECRET);
    // console.log(payload);
  } catch {
    return next(new AppError('Incorrect Token', 401));
  }

  //3) Check if user still exists or not

  checkUser = await User.findById(payload.id);
  if (!checkUser) {
    return next(new AppError('User no longer exist now', 401));
  }

  req.user = checkUser;
  res.locals.user = checkUser;

  next();

  ////////////////// PENDING FOR FUTURE//////////////////////
  //4) Check if user changed password after the token is issued

  ///////////////////////////////////////////////////////////
});

////////////////ONLY FOR RENDERED PAGES//////////////////////////////
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const verify = promisify(jwt.verify);
      payload = await verify(req.cookies.jwt, process.env.JWT_SECRET);

      checkUser = await User.findById(payload.id);
      res.locals.user = checkUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

//////////////////LOGOUT/////////////////////////////

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success'
  });
};

////////// ROLES PERMISSIONS///////////

exports.permission = (...roles) => {
  //roles= ['admin', 'lead-guide]
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(' You do not have permission for this request', 403)
      );
    }
    next();
  };
};

//########################### FORGET PASSWORD AND RESET PASSWORD ##############################///////////

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Check the user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  //2) Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) Send token to Email address using Nodemailer.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  // const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\n If you didn't forget your password, please ignore this email`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token is valid for 10 minutes',
    //   message
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
//########################################################################////////////////////////
exports.resetPassword = async (req, res, next) => {
  //1) Get user based on the recieved token
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired'), 400);
  }

  //2) If the token is not expired and the user is available, set the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changedPasswordAt property for the user- FUTURE-------------------
  //4) Log the user in and send JWT.
  sendToken(user, 200, res);
};
//#######################################################################//////////////////

//This functionality gives the login users privelege to update their current password. User will enter his current password and new password and new password confim
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the address
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(
      new AppError(
        'User is not available, please log in again using another email address'
      ),
      500
    );
  }
  //2) Check if Posted Current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('The current password is not correct'), 500);
  }

  //3) If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //Here we didn't use validateBeforesave to false, because we want all the validators to run.

  //4) Log user in, send JWT
  sendToken(user, 200, res);
  //User.findByIdAndUpdate will not work as we want because password validation and pre middlewares run only in case of CREATE/SAVE.
});

//##################################################//////////
