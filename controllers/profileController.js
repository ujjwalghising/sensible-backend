import User from "../models/User.js";
import fs from "fs";
import path from "path";

// Update Profile Picture
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id; // Get the authenticated user's ID
    const imagePath = `uploads/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove old profile picture if it exists
    if (user.profilePicture) {
      const oldImagePath = path.join("uploads", path.basename(user.profilePicture));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user profile with new image path
    user.profilePicture = imagePath;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: imagePath,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
};
