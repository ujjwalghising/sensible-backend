import express from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password, gender, age } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password || !gender || !age) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      age,
    });

    // Return user details
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      gender: newUser.gender,
      age: newUser.age,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});
// Update User Profile
router.put("/profile/:id", async (req, res) => {
  const { name, gender, age } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    user.name = name || user.name;
    user.gender = gender || user.gender;
    user.age = age || user.age;

    // Save updated user
    await user.save();

    // Return updated user details
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;