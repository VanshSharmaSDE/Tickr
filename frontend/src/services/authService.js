import api from './api';

export const authService = {
  // Register new user (Step 1: Send OTP)
  registerSendOTP: (name, email, password) => {
    return api.post('/auth/register/send-otp', {
      name,
      email,
      password,
    });
  },

  // Register new user (Step 2: Verify OTP)
  registerVerifyOTP: (email, otp) => {
    return api.post('/auth/register/verify-otp', {
      email,
      otp,
    });
  },

  // Resend verification OTP
  resendVerificationOTP: (email) => {
    return api.post('/auth/register/resend-otp', {
      email,
    });
  },

  // Legacy register (for backward compatibility)
  register: (name, email, password) => {
    return api.post('/auth/register', {
      name,
      email,
      password,
    });
  },

  // Login user
  login: (email, password) => {
    return api.post('/auth/login', {
      email,
      password,
    });
  },

  // Get user profile
  getProfile: () => {
    return api.get('/auth/profile');
  },

  // Forgot password (Step 1: Send OTP)
  forgotPasswordSendOTP: (email) => {
    return api.post('/auth/forgot-password/send-otp', {
      email,
    });
  },

  // Forgot password (Step 2: Verify OTP)
  forgotPasswordVerifyOTP: (email, otp) => {
    return api.post('/auth/forgot-password/verify-otp', {
      email,
      otp,
    });
  },

  // Resend password reset OTP
  resendPasswordResetOTP: (email) => {
    return api.post('/auth/forgot-password/resend-otp', {
      email,
    });
  },

  // Legacy forgot password (for backward compatibility)
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', {
      email,
    });
  },

  // Reset password
  resetPassword: (token, password) => {
    return api.post('/auth/reset-password', {
      token,
      password,
    });
  },

  // Update user name
  updateName: (name) => {
    return api.put('/auth/update-name', {
      name,
    });
  },

  // Delete user account
  deleteAccount: (password) => {
    return api.delete('/auth/delete-account', {
      data: { password },
    });
  },
};
