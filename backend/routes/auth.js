const express = require('express');
const auth = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get user profile
router.get('/profile', auth, getProfile);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
