const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email verification OTP
const sendVerificationOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Tickr App" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Email Verification - Tickr App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Tickr App!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Tickr App. Please verify your email address using the OTP below:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification OTP sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification OTP:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP
const sendPasswordResetOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Tickr App" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Password Reset - Tickr App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password for your Tickr App account. Please use the OTP below:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return { success: false, error: error.message };
  }
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendVerificationOTP,
  sendPasswordResetOTP,
  generateOTP
};
