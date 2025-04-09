import User from '../models/User.js';
import Order from '../models/Order.js'; // optional, only if it exists
import Product from '../models/Product.js'; // optional too
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


// Admin dashboard overview (total users, orders, etc.)
export const getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalOrders = Order ? await Order.countDocuments() : 0;
    const totalProducts = Product ? await Product.countDocuments() : 0;

    res.json({
      totalUsers,
      totalAdmins,
      totalOrders,
      totalProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users (without passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get all orders (if order model exists)
export const getAllOrders = async (req, res) => {
  try {
    if (!Order) return res.status(404).json({ message: 'Order model not found' });

    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Example: Basic analytics placeholder
export const getAnalytics = async (req, res) => {
  try {
    const usersPerRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({ usersPerRole });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};

// Example: Get and update app settings (from DB or env)
let settingsCache = {
  maintenanceMode: false,
  welcomeMessage: 'Welcome to Admin Panel!'
};

export const getSettings = (req, res) => {
  res.json(settingsCache);
};

export const updateSettings = (req, res) => {
  const { maintenanceMode, welcomeMessage } = req.body;
  settingsCache = { maintenanceMode, welcomeMessage };
  res.json({ message: 'Settings updated', settings: settingsCache });
};
// Create a user
export const createUser = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const newUser = new User({ name, email, password, role });
      await newUser.save();
  
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: 'Error creating user', error: err.message });
    }
  };
  
  // Update user
  export const updateUser = async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: 'Error updating user' });
    }
  };
  
  // Delete user
  export const deleteUser = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  };
  
  // Update admin profile
  export const updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) user.password = req.body.password;
  
      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  };

  

export const inviteAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create invite token
    const inviteToken = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const inviteLink = `${process.env.ADMIN_FRONTEND_URL}/register?token=${inviteToken}`;

    // Send invite email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Invitation',
      html: `<p>You are invited to join as an admin. Click the link below to register:</p><a href="${inviteLink}">Register as Admin</a>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Admin invite sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const registerAdmin = async (req, res) => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const { name, password, token } = req.body;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email, role } = decoded;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);

 
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        isVerified: true, // optional for admin
      });
  
      res.status(201).json({ message: 'Admin registered successfully' });
  
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired token', error: error.message });
    }
  };

  export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Invalid credentials or not an admin' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
  
      res
        .cookie('adminToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
          message: 'Logged in successfully',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
  
    } catch (error) {
      res.status(500).json({ message: 'Login error', error: error.message });
    }
  };
  export const logoutAdmin = (req, res) => {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
  
    res.status(200).json({ message: "Logged out successfully" });
  };
  
  