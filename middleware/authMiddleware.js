import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware: Verifies token from HttpOnly cookie
export const protect = async (req, res, next) => {
  const token = req.cookies.token; // ✅ Get token from cookie
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware: Checks if logged-in user is admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access only' });
  }
};
