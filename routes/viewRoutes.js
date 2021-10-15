const express = require('express');

const router = express.Router();
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
//TEMPLATE ROUTES USING PUG

// router.use();

router.get(
  '/',
  bookingController.createBooking,
  authController.isLogged,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLogged, viewsController.getTourView);
router.get('/login', authController.isLogged, viewsController.login);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
