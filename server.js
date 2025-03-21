import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import connectDB from './config/db.js';
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ CORS Configuration
app.use(cors());

app.use(express.json());

// ✅ API Routes
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api", authRoutes);   // Ensure the base path is set


// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});

// ✅ Serve Frontend (if you want to deploy it together)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  res.status(500).json({ message: "Server error", error: err.message });
});


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});