import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
