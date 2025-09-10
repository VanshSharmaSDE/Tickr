const express = require('express');
const auth = require('../middleware/auth');
const {
  registerSendOTP,
  registerVerifyOTP,
  resendVerificationOTP,
  login,
  getProfile,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  resendPasswordResetOTP,
  resetPassword,
  // Legacy endpoints
  register,
  forgotPassword
} = require('../controllers/authController');

const router = express.Router();

// Registration with OTP
router.post('/register/send-otp', registerSendOTP);
router.post('/register/verify-otp', registerVerifyOTP);
router.post('/register/resend-otp', resendVerificationOTP);

// Legacy register endpoint (for backward compatibility)
router.post('/register', register);

// Login
router.post('/login', login);

// Get user profile
router.get('/profile', auth, getProfile);

// Password reset with OTP
router.post('/forgot-password/send-otp', forgotPasswordSendOTP);
router.post('/forgot-password/verify-otp', forgotPasswordVerifyOTP);
router.post('/forgot-password/resend-otp', resendPasswordResetOTP);

// Legacy forgot password endpoint (for backward compatibility)
router.post('/forgot-password', forgotPassword);

// Reset password (final step after OTP verification)
router.post('/reset-password', resetPassword);

module.exports = router;
