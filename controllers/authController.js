//authController.js file is used to handle the user registration, email verification, and login processes.
//It uses the User model to interact with the database and bcrypt to hash passwords.
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Email sender function
const sendVerificationEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Email Verification",
    text: `Please verify your email by clicking the link: ${verificationLink}`,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Register route
export const register = async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      verified: false,  // Unverified by default
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser);

    res.status(201).json({
      message: "User registered. Please verify your email.",
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// ✅ Email verification route
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    // ✅ Mark the user as verified
    user.verified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Invalid or expired token." });
  }
};

// ✅ Login route with email verification check
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};


