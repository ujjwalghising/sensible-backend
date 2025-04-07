import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  console.log("🔒 Incoming cookies:", req.cookies);

  const token = req.cookies.adminToken;
  console.log("📦 Token received:", token);

  if (!token) {
    console.log("❌ No token found in cookies");
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log("❌ User not found for decoded ID:", decoded.id);
      res.status(401);
      throw new Error('User not found');
    }

    console.log("👤 Authenticated user:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Admin access only');
  }
};

export const authenticate = (req, res, next) => {
  const token = req.cookies.adminToken; // Retrieve token from cookies

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach the decoded user info to the request object
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

