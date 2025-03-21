import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
});

const User = mongoose.model("User", userSchema);
export default User;
