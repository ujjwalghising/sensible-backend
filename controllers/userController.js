import User from '../models/User.js';

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.status(200).json(user);
};

export const updateProfile = async (req, res) => {
  const { name, email, address, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;
  user.address = address || user.address;
  user.phone = phone || user.phone;

  await user.save();
  res.status(200).json(user);
};