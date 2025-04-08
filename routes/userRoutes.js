import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);


router.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // Use "Strict" or "Lax" if frontend is on same domain
      path: "/",         // Match the original cookie path
    });
  
    res.status(200).json({ message: "Logged out successfully" });
  });

export default router;