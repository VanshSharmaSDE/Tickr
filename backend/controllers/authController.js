const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationOTP, sendPasswordResetOTP, generateOTP } = require('../utils/emailService');

// Register user (Step 1: Send OTP)
const registerSendOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // If user exists but not verified, update their details
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password; // Will be hashed by pre-save hook
      existingUser.emailVerificationOTP = otp;
      existingUser.emailVerificationOTPExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // Create new user
      const user = new User({
        name,
        email,
        password,
        isVerified: false,
        emailVerificationOTP: otp,
        emailVerificationOTPExpiry: otpExpiry
      });
      await user.save();
    }

    // Send OTP email
    const emailResult = await sendVerificationOTP(email, name, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send verification email',
        error: emailResult.error 
      });
    }

    res.status(200).json({
      message: 'Verification OTP sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Register send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register user (Step 2: Verify OTP and complete registration)
const registerVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user with matching email and OTP
    const user = await User.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Register verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend verification OTP
const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      return res.status(404).json({ message: 'User not found or already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendVerificationOTP(email, user.name, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send verification email',
        error: emailResult.error 
      });
    }

    res.json({ message: 'Verification OTP resent successfully' });
  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: email
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password (Step 1: Send OTP)
const forgotPasswordSendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or email not verified' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendPasswordResetOTP(email, user.name, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send password reset email',
        error: emailResult.error 
      });
    }

    res.json({
      message: 'Password reset OTP sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Forgot password send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password (Step 2: Verify OTP)
const forgotPasswordVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a temporary reset token for the next step
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    // Clear OTP fields
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    await user.save();

    res.json({
      message: 'OTP verified successfully',
      resetToken: resetToken // This should be used for the next step
    });
  } catch (error) {
    console.error('Forgot password verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend password reset OTP
const resendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or email not verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendPasswordResetOTP(email, user.name, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send password reset email',
        error: emailResult.error 
      });
    }

    res.json({ message: 'Password reset OTP resent successfully' });
  } catch (error) {
    console.error('Resend password reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerSendOTP,
  registerVerifyOTP,
  resendVerificationOTP,
  login,
  getProfile,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  resendPasswordResetOTP,
  resetPassword,
  // Legacy endpoints (keeping for backward compatibility)
  register: registerSendOTP,
  forgotPassword: forgotPasswordSendOTP
};
