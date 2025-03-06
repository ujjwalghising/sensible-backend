// models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    profilePicture: { type: String }, // URL for profile picture (optional)
    bio: { type: String },            // User bio (optional)
  },
  { timestamps: true }
);

// Prevent model overwrite if already declared
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;