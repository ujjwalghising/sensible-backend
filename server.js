import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";   // ✅ Fix for __dirname with ES modules
import connectDB from './config/db.js';
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api", authRoutes);   // Ensure the base path is set

// ✅ Error Handling Middleware (place it BEFORE serving frontend)
app.use((err, req, res, next) => {
  console.error("🔥 Internal Server Error:", err.message);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ✅ Serve Frontend (if you want to deploy it together)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
