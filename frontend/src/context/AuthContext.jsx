import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user profile
      authService.getProfile()
        .then(response => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Function to reset user settings and trigger context updates
  const resetUserSettingsAndTheme = () => {
    // Clear existing user-specific settings from localStorage
    localStorage.removeItem('userSettings');
    localStorage.removeItem('taskViewMode');
    
    // Trigger a custom event to notify other contexts to refresh
    window.dispatchEvent(new CustomEvent('userLogin', { 
      detail: { timestamp: Date.now() } 
    }));
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      toast.success(`Welcome back, ${user.name}!`);
      
      // Reset user settings and trigger context updates instead of reloading
      resetUserSettingsAndTheme();
      
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || 'Login failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      
      // Check if user needs email verification
      if (errorData?.requiresVerification) {
        toast.error(message);
        return { 
          success: false, 
          message, 
          requiresVerification: true,
          email: errorData.email 
        };
      }
      
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(name, email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      toast.success(`Welcome to Tickr, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, message };
    }
  };

  // New OTP-based registration methods
  const registerSendOTP = async (name, email, password) => {
    try {
      // Don't set global loading - let component handle its own loading state
      const response = await authService.registerSendOTP(name, email, password);
      
      toast.success('Verification code sent to your email');
      return { success: true, email: response.data.email };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const registerVerifyOTP = async (email, otp) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.registerVerifyOTP(email, otp);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      toast.success(`Welcome to Tickr, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid verification code';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, message };
    }
  };

  const resendVerificationOTP = async (email) => {
    try {
      await authService.resendVerificationOTP(email);
      toast.success('Verification code resent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, message };
    }
  };

  // New OTP-based forgot password methods
  const forgotPasswordSendOTP = async (email) => {
    try {
      const response = await authService.forgotPasswordSendOTP(email);
      
      toast.success('Password reset code sent to your email');
      return { success: true, email: response.data.email };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const forgotPasswordVerifyOTP = async (email, otp) => {
    try {
      const response = await authService.forgotPasswordVerifyOTP(email, otp);
      const { resetToken } = response.data;
      
      toast.success('Code verified successfully');
      return { success: true, resetToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid verification code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resendPasswordResetOTP = async (email) => {
    try {
      await authService.resendPasswordResetOTP(email);
      toast.success('Reset code resent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateName = async (name) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.updateName(name);
      const updatedUser = response.data.user;
      
      // Update user in state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: updatedUser, 
          token: state.token 
        },
      });
      
      toast.success('Name updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update name';
      toast.error(message);
      return { success: false, message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateName,
    // OTP methods
    registerSendOTP,
    registerVerifyOTP,
    resendVerificationOTP,
    forgotPasswordSendOTP,
    forgotPasswordVerifyOTP,
    resendPasswordResetOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
