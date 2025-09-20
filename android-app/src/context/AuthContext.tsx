import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Verify token and get user profile
          const response = await authService.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Hello ${user.name}`,
      });
      
      return { success: true };
    } catch (error: any) {
      const errorData = error.response?.data;
      const message = errorData?.message || 'Login failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      
      // Check if user needs email verification
      if (errorData?.requiresVerification) {
        Toast.show({
          type: 'error',
          text1: 'Verification Required',
          text2: message,
        });
        return { 
          success: false, 
          message, 
          requiresVerification: true,
          email: errorData.email 
        };
      }
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message,
      });
      
      return { success: false, message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(name, email, password);
      const message = response.data?.message || 'Registration successful! Please check your email to verify your account.';
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email to verify your account',
      });
      
      return { success: true, message };
    } catch (error: any) {
      const errorData = error.response?.data;
      const message = errorData?.message || 'Registration failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: message,
      });
      
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userSettings');
      dispatch({ type: 'LOGOUT' });
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'See you soon!',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.forgotPassword(email);
      const message = response.data?.message || 'Password reset link sent to your email';
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      Toast.show({
        type: 'success',
        text1: 'Reset Link Sent',
        text2: message,
      });
      
      return { success: true, message };
    } catch (error: any) {
      const errorData = error.response?.data;
      const message = errorData?.message || 'Failed to send reset link';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: message,
      });
      
      return { success: false, message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};