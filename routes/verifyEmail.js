import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid or missing token.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (user.verified) {
      return res.status(400).send("Email already verified.");
    }

    user.verified = true;
    await user.save();

    res.status(200).send("Email verified successfully.");
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).send("Invalid or expired token.");
  }
});

export default router;
