import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'ghisingujjwal13@gmail.com';
    const password = 'password1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log('User role updated to admin.');
    } else {
      await User.create({
        name: 'Admin User',
        email,
        password: hashedPassword,
        isVerified: true,
        role: 'admin',
      });
      console.log('Admin user created.');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
