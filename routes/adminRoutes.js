import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getDashboardData,
  getAllOrders,
  getAnalytics,
  getSettings,
  updateSettings,
  inviteAdmin,
  registerAdmin,
  loginAdmin // 👈 add this
} from '../controllers/adminController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';


const router = express.Router();

// Admin Dashboard
router.get('/dashboard', protect, adminOnly, getDashboardData);

// Users CRUD
router
  .route('/users')
  .get(protect, adminOnly, getAllUsers)
  .post(protect, adminOnly, createUser);

router
  .route('/users/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

// Orders (if model exists)
router.get('/orders', protect, adminOnly, getAllOrders);

// Analytics
router.get('/analytics', protect, adminOnly, getAnalytics);

// Settings
router
  .route('/settings')
  .get(protect, adminOnly, getSettings)
  .put(protect, adminOnly, updateSettings);

// Admin profile
router.route('/profile').put(protect, adminOnly, updateProfile);

// Health check
router.get('/ping', (req, res) => {
  res.json({ message: 'Admin route is working' });
});
router.post('/login', loginAdmin);


// Only an authenticated admin can invite another admin
router.post('/invite', protect, adminOnly, inviteAdmin);


// Route used by invited user to register using the token
router.post('/register-invite', registerAdmin);
export default router;
