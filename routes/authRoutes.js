import express from 'express';
import { getMe } from '../controllers/authController.js'; // ✅ Create this
import { logout } from "../controllers/authController.js";
import { protect } from '../middleware/authMiddleware.js'; 
import { register, login, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();
if (req.path === '/api/products/stock-updates') {
    return next(); // Skip auth for SSE if public, or handle cookies manually here
  }
  
router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post("/logout", logout);

export default router;