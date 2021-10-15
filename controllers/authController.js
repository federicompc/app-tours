const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/emails');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //HTTP ONLY COOKIE
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //BODY RES
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/me`;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  await new Email(newUser, url).sendWelcome();
  console.log(url);
  const token = signToken(newUser._id);

  res.status(200).json({
    user: {
      name: newUser.name,
      token: token,
      role: newUser.role,
      email: newUser.email,
      photo: newUser.photo,
      passwordChangedAt: newUser.passwordChangedAt,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please enter a valid email and password', 400));
  }
  //check if user exist and pass exists and are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Please enter a valid email and password', 401));
  }
  //if ok send a token
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});
exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  //get token and check if it

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('Sorry you are not logged, please login first', 401)
    );
  }
  //   console.log(token);
  //verification signToken
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new Error('The user no longer exist', 401));
  }

  // check if user changed password after token was issued
  console.log(freshUser);
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new Error('The user password was changed, please log in', 401));
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error('You dont have permission for this route', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1-get user based on post email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  //2- generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3- send it to users.email

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError('there was an error sending your password reset', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not exired then
  if (!user) {
    next(new AppError('token expired or invalid', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  // we did this on model user
  // user.passwordChangedAt = Date.now();
  await user.save();
  // update passwordChangedAt
  createSendToken(user, 200, res);
  //login user
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user information
  const user = await User.findById(req.user.id).select('+password');
  //check current password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  //campare information
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm; //
  await user.save();
  //login
  createSendToken(user, 200, res);
});
//only for render pages without error to check if user is logged
exports.isLogged = async (req, res, next) => {
  //get token and check if it
  if (req.cookies.jwt) {
    try {
      //   console.log(token);
      //verification signToken
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //check if user exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      // console.log(freshUser);
      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
