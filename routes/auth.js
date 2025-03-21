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


    // ✅ Try sending email but continue even if it fails
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
      const emailContent = `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}" target="_blank">Verify Email</a>
      `;

      await sendEmail(email, "Email Verification", emailContent);

      // ✅ Respond only if email is sent successfully
      res.status(201).json({ message: "Please check your email to verify your account." });

    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);

      // ✅ Send partial success response even if email fails
      res.status(201).json({
        message: "User registered, but email could not be sent. Please verify later."
      });
    }

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ✅ Login Route
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
    console.error("🔥 Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
