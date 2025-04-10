const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleWare');

// User registration route
router.post('/register', userController.register);
// User login route
router.post('/login', userController.login);
// User logout route
router.get('/logout', userController.logout);
//Get user profile route
router.get('/profile', authMiddleware.userAuthMiddleware , userController.getUserProfile);

module.exports = router;