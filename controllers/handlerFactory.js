const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('no match for this ID', 404));
    }
    res.status(204).json({
      status: '204',
      message: 'deleted ',
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no match for this ID', 404));
    }
    res.status(201).json({
      status: '201',
      message: 'updated doc',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = !popOptions
      ? await Model.findById(req.params.id)
      : await Model.findById(req.params.id).populate(popOptions);

    if (!doc) {
      return next(new AppError('no match for this ID', 404));
    }
    res.json({
      status: 'Success',
      time: req.dateTime,
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //allow reviews from tours
    let filter = {};
    if (req.params.tourId) filter = { tours: req.params.tourId };
    console.log(req.params.tourId);

    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    // const docs = await features.query.explain();
    const docs = await features.query;
    //SEND RESPONSE
    res.json({
      status: 'Success',
      quantity: docs.length,
      time: req.dateTime,
      data: {
        docs,
      },
    });
  });
