const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// router.param('id', tourController.checkId);

router
  .route('/checkout-session/:tourId')
  .get(authController.protect, bookingController.getCheckoutSession);
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    bookingController.createBooking
  );
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    bookingController.updateBooking
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bookingController.deleteBooking
  );

module.exports = router;
