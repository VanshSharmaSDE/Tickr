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

// Update user name only
const updateUserName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a valid name' });
    }

    // Trim and validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    // Update user name
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: trimmedName },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationOTP -emailVerificationOTPExpiry -passwordResetOTP -passwordResetOTPExpiry');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Name updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    });

  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ 
      message: 'Failed to update name',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user account permanently
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Import models for cleanup (lazy import to avoid circular dependency issues)
    const Task = require('../models/Task');
    const TaskProgress = require('../models/TaskProgress');

    try {
      // Delete all user's task progress
      await TaskProgress.deleteMany({ user: userId });
      console.log(`Deleted task progress for user: ${userId}`);

      // Delete all user's tasks
      await Task.deleteMany({ user: userId });
      console.log(`Deleted tasks for user: ${userId}`);

      // Delete user account
      await User.findByIdAndDelete(userId);
      console.log(`Deleted user account: ${userId}`);

      res.json({
        success: true,
        message: 'Account deleted successfully. All your data has been permanently removed.'
      });

    } catch (cleanupError) {
      console.error('Error during account cleanup:', cleanupError);
      // If cleanup fails, still try to delete the user
      await User.findByIdAndDelete(userId);
      
      res.json({
        success: true,
        message: 'Account deleted successfully. Some data cleanup may be pending.'
      });
    }

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  registerSendOTP,
  registerVerifyOTP,
  resendVerificationOTP,
  login,
  getProfile,
  updateUserName,
  deleteAccount,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  resendPasswordResetOTP,
  resetPassword,
  // Legacy endpoints (keeping for backward compatibility)
  register: registerSendOTP,
  forgotPassword: forgotPasswordSendOTP
};
