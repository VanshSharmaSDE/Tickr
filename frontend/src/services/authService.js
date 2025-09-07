import api from './api';

export const authService = {
  // Register new user
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

  // Forgot password
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
};
