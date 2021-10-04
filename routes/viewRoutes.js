const express = require('express');

const router = express.Router();
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');
//TEMPLATE ROUTES USING PUG

router.use(authController.isLogged);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTourView);
router.get('/login', viewsController.login);

module.exports = router;
