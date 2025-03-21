import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";  // ✅ Added missing import

const router = express.Router();

// ✅ Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      verificationToken,
    });

    await newUser.save();

    // Send Verification Email
    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

    const emailContent = `
      <h1>Verify Your Email please</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}" target="_blank">Verify Email</a>
    `;

    await sendEmail(email, "Email Verification", emailContent);

    res.status(201).json({ message: "Please check your email to verify your account." });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Email Verification Route
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user || user.isVerified) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login Route (Moved outside the verify route)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("name email gender");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Ensure all fields are returned
    res.json({
      name: user.name || "N/A",
      email: user.email || "N/A",
      gender: user.gender || "N/A"
    });

  } catch (error) {
    console.error("Error in profile route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
