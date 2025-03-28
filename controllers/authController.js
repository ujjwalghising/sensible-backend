import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your email',
      html: `
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}">Verify Email</a>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered. Check your email to verify your account.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔥 Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      // Redirect with status=failed if token is invalid
      return res.redirect(`${process.env.FRONTEND_URL}/verify?status=failed`);
    }

    if (user.isVerified) {
      // Redirect with status=already-verified
      return res.redirect(`${process.env.FRONTEND_URL}/verify?status=already-verified`);
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    // Redirect with status=success
    res.redirect(`${process.env.FRONTEND_URL}/verify?status=success`);

  } catch (error) {
    console.error('Verification error:', error);
    // Redirect with status=error on exception
    res.redirect(`${process.env.FRONTEND_URL}/verify?status=error`);
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Send the reset token via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const resetURL = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }  // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};