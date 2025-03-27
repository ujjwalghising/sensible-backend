import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Register a new user
export const register = async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const user = new User({ name, email, password: hashedPassword, gender, verificationToken });
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "User registered. Please check your email for verification." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(400).json({ error: "Invalid token." });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "Invalid email or password." });
    if (!user.isVerified) return res.status(401).json({ error: "Email not verified." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

// Resend verification email


export const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified." });
    }

    // Generate a new verification token
    const verificationToken = Math.random().toString(36).substr(2, 25);
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: "Verification email has been sent again." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
};
