import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";  // Authentication routes
import productRoutes from "./routes/product.route.js";  // Product routes (corrected)
import { connectDb } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000; // Default to 5000 if no PORT in .env

// Basic test route
app.get("/", (req, res) => {
  res.status(200).send("How are you?");
});

// Middleware
app.use(express.json());
app.use(cookieParser());  // Corrected cookie-parser usage

// Routes
app.use("/api/auth",authRoutes);  // Authentication routes
app.use("/api/products",productRoutes);  // Product routes (corrected)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDb();  // Connecting to MongoDB
});
