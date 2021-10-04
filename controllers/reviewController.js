const Review = require('../models/reviewsModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//MIDLEWARE FOR CREATING REVIEW FROM TOUR (THIS ALLOWS TO USE FACTORY)
exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tours) req.body.tours = req.params.tourId;
  if (!req.body.user) req.body.user = req.user;
  next();
};

//FACTORY
exports.createReview = factory.createOne(Review);
exports.getOneReview = factory.getOne(Review);
exports.getReview = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
