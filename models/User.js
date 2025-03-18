import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  profileImage: { type: String, default: "" },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

const User = mongoose.model("User", userSchema);
export default User;
