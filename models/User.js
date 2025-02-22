import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    age: { 
      type: Number, 
      required: true 
    },
    gender: { 
      type: String, 
      enum: ['Male', 'Female', 'Other'], 
      required: true 
    },
    profilePicture: { 
      type: String, 
      default: "" 
    },
    bio: { 
      type: String, 
      default: "" 
    }
  },
  { timestamps: true }
);

// Hash password before saving the user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip hashing if password is not modified
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    next(err); // If an error occurs, pass it to the next middleware
  }
});

// Method to compare hashed password during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password); // Compare provided password with the hashed one
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
