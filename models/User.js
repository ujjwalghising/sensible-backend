//User.js
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ["male", "female", "other"]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  isVerified: { type: Boolean, default: false },

  verificationToken:{
    type: String,
  },
});

// ✅ Automatically update `updatedAt` before every `save` operation
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
