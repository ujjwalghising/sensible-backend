import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";   // ✅ Fix for __dirname with ES modules
import connectDB from './config/db.js';
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Import admin routes
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175",
      "https://sensible-frontned.vercel.app"
    ],
    credentials: true,  // must be true to send cookies
  })
);

app.set('trust proxy', 1); // 💡 Required for Railway to handle cookies properly

app.use(cookieParser()); // ✅ Middleware for parsing cookies
app.use(express.json());

// ✅ API Routes
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes); // Use admin routes

console.log("✅ Loaded ENV Variables:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Not Set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not Set");
console.log("BASE_URL:", process.env.BASE_URL);
console.log("EMAIL_USER:", process.env.EMAIL_USER);

// ✅ Fix: Serve SSE endpoint before static serving!
app.get("/api/products/stock-updates", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    console.log("🟢 Client connected to stock updates");

    const sendInitial = () => {
      res.write(`data: ${JSON.stringify({ message: "Connected to stock updates" })}\n\n`);
    };

    sendInitial();

    // Add listener to send updates later (or simulate it)
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: "stock", timestamp: Date.now() })}\n\n`);
    }, 10000);

    req.on("close", () => {
      console.log("🔴 Client disconnected from stock updates");
      clearInterval(interval);
      res.end();
    });

  } catch (error) {
    console.error("❌ Error in SSE endpoint:", error);
    res.status(500).end("SSE Error");
  }
});


// ✅ Serve Frontend (after all API + SSE routes)
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
