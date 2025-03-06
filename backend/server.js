import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from './config/db.js';
import User from "./models/User.js";
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";

// Load environment variablesnode
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes)

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});
const fetchCartItems = () => {
  axios.get('/api/cart') // Correct route
    .then((response) => {
      setCartItems(response.data);
    })
    .catch((error) => console.error('Error fetching cart items:', error));
};


// ✅ Mongoose User Model (with age and gender)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    profilePicture: { type: String }, // URL to profile picture (optional)
    bio: { type: String }, // User bio (optional)
  },
  { timestamps: true }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// ✅ API Route for User Registration
app.post("/api/register", async (req, res) => {
  const { name, email, password, age, gender, profilePicture, bio } = req.body;

  if (!name || !email || !password || !age || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      profilePicture,
      bio,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// ✅ API Route for User Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// ✅ Middleware to Verify Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ API Route to Get User Profile
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      profilePicture: user.profilePicture,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ API Route to Update User Profile
app.put("/api/profile", verifyToken, async (req, res) => {
  const { name, age, gender, bio, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
});


// ✅ Root Route (Check if server is running)
app.get("/", (req, res) => {
  res.send("Welcome to the Clothing Store API!");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});