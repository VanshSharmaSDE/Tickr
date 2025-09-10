import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateRequired } from '../utils/validation';
import OTPVerification from '../components/OTPVerification';
import ResetPassword from '../components/ResetPassword';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false); // Local loading for email step
  const [resendLoading, setResendLoading] = useState(false); // Resend loading state
  const { forgotPasswordSendOTP, forgotPasswordVerifyOTP, resendPasswordResetOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLocalLoading(true);
      const result = await forgotPasswordSendOTP(email);
      if (result.success) {
        setLocalLoading(false);
        setStep('otp');
      } else {
        setLocalLoading(false);
      }
    } catch (error) {
      console.error('Error sending reset OTP:', error);
      setLocalLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    const result = await forgotPasswordVerifyOTP(email, otp);
    if (result.success) {
      setResetToken(result.resetToken);
      setStep('reset');
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      await resendPasswordResetOTP(email);
    } catch (error) {
      console.error('Error resending OTP:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setLocalLoading(false);
    setResendLoading(false);
  };

  const handlePasswordResetSuccess = () => {
    navigate('/login');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Show OTP verification step
  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        type="password-reset"
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        onBack={handleBackToEmail}
        loading={false} // OTP component handles its own loading
        resendLoading={resendLoading}
      />
    );
  }

  // Show reset password step
  if (step === 'reset') {
    return (
      <ResetPassword
        resetToken={resetToken}
        onSuccess={handlePasswordResetSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Show email input step
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Forgot password?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a code to reset your password
            </p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: localLoading ? 1 : 1.02 }}
              whileTap={{ scale: localLoading ? 1 : 0.98 }}
              type="submit"
              disabled={localLoading}
              className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {localLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending reset code...
                </div>
              ) : (
                'Send reset code'
              )}
            </motion.button>

            {/* Back to login link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>

      {/* Right Side - Logo and Animation */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center z-10"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <img 
              src="/logo.png" 
              alt="Tickr Logo" 
              className="w-32 h-32 mx-auto rounded-3xl shadow-2xl bg-white"
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Tickr
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-xl text-purple-100"
          >
            We'll Help You Get Back
          </motion.p>
        </motion.div>

        {/* Animated Background Elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-20 left-10 w-16 h-16 bg-white/5 rounded-full"
        />
        <motion.div
          animate={{ 
            y: [-10, 10, -10]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/3 left-20 w-8 h-8 bg-white/10 rounded-full"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
