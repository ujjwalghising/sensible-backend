import express from "express";
import upload from "../middleware/upload.js";
import { updateProfilePicture } from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";    // Correct import

const router = express.Router();

// Profile picture upload route
router.post("/upload", verifyToken, upload.single("profilePicture"), updateProfilePicture);   // Use `verifyToken`

export default router;
