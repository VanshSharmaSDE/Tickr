import api from './api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MessageResponse {
  message: string;
}

export const authService = {
  // Register new user (Step 1: Send OTP)
  registerSendOTP: (name: string, email: string, password: string) => {
    return api.post<MessageResponse>('/auth/register/send-otp', {
      name,
      email,
      password,
    });
  },

  // Register new user (Step 2: Verify OTP)
  registerVerifyOTP: (email: string, otp: string) => {
    return api.post<AuthResponse>('/auth/register/verify-otp', {
      email,
      otp,
    });
  },

  // Resend verification OTP
  resendVerificationOTP: (email: string) => {
    return api.post<MessageResponse>('/auth/register/resend-otp', {
      email,
    });
  },

  // Legacy register (for backward compatibility)
  register: (name: string, email: string, password: string) => {
    return api.post<MessageResponse>('/auth/register', {
      name,
      email,
      password,
    });
  },

  // Login user
  login: (email: string, password: string) => {
    return api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
  },

  // Get user profile
  getProfile: () => {
    return api.get<{ user: any }>('/auth/profile');
  },

  // Forgot password (Step 1: Send OTP)
  forgotPasswordSendOTP: (email: string) => {
    return api.post<MessageResponse>('/auth/forgot-password/send-otp', {
      email,
    });
  },

  // Forgot password (Step 2: Verify OTP and reset)
  forgotPasswordVerifyOTP: (email: string, otp: string, newPassword: string) => {
    return api.post<MessageResponse>('/auth/forgot-password/verify-otp', {
      email,
      otp,
      newPassword,
    });
  },

  // Legacy forgot password (for backward compatibility)
  forgotPassword: (email: string) => {
    return api.post<MessageResponse>('/auth/forgot-password', {
      email,
    });
  },

  // Resend forgot password OTP
  resendForgotPasswordOTP: (email: string) => {
    return api.post<MessageResponse>('/auth/forgot-password/resend-otp', {
      email,
    });
  },

  // Verify email
  verifyEmail: (token: string) => {
    return api.post<MessageResponse>('/auth/verify-email', {
      token,
    });
  },

  // Change password (authenticated user)
  changePassword: (currentPassword: string, newPassword: string) => {
    return api.put<MessageResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Delete account
  deleteAccount: (password: string) => {
    return api.post<MessageResponse>('/auth/delete-account', {
      password,
    });
  },
};