const express = require('express');
const router = express.Router();

const captainController = require('../controllers/captain.controller');
const authMiddleware = require('../middleware/authMiddleWare');

// User registration route
router.post('/register', captainController.register);
// User login route
router.post('/login', captainController.login);
// User logout route
router.get('/logout', captainController.logout);
//Get user profile route
router.get('/profile', authMiddleware.captainAuthMiddleware , captainController.getCaptainProfile);

router.patch('/toggle-availability', authMiddleware.captainAuthMiddleware , captainController.toggleAvailability);

router.get('/new-ride', authMiddleware.captainAuthMiddleware , captainController.pollNewRide);

module.exports = router;