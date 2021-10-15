const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get current tour session
  const tour = await Tour.findById(req.params.tourId);
  console.log('tour', tour);
  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [
          'https://lh3.googleusercontent.com/proxy/khrnHmHs1NhkLVmpPYfMsZ7o7f9dijjX6T5zS2Twown4xAK59HP6YZR3DrKIL2jYcQGEISou4uSd8bP4gPoF752gLxHwSX0XnoAHUltsVlehv6mU_o3jNPy-jTvyztKZG4u1todRwt0X0lICGzkiGrf3QAqhLegB8vKwvwQygIZFrKro0Xv5BPfBGGdKMNh8qen-ExXlygzfk0tZGAMYLUDsuGbTtJR1KZ2n',
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  console.log('checkout', session);
  // vreate session  as response

  res.status(200).send({
    status: 'success',
    session,
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!user || !tour || !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

//FACTORY
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
