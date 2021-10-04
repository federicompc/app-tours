const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// router.param('id', tourController.checkId);

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourAndUserId,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
