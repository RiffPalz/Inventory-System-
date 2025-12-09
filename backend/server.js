// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/database.js";
import path from "path";
import morgan from "morgan"; // optional (install with `npm i morgan`) - helpful for dev logging

import adminRouter from "./routes/adminRoute.js";
import productRouter from "./routes/productRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan ? morgan("dev") : (req, res, next) => next()); // safe no-op if morgan not installed
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder (ensure this matches your upload middleware path)
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Mount routers (keep base path /api/admin as you had it)
app.use("/api/admin", adminRouter);
app.use("/api/admin/products", productRouter);

// Health check
app.get("/", (req, res) => res.send("API working"));

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (catches multer and other errors)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  // Multer errors (file size, file count, etc.)
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  // File type / custom upload errors from fileFilter usually come here as Error
  if (err.message && err.message.toLowerCase().includes("only images")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Validation-style errors
  if (err.status && Number(err.status) >= 400 && Number(err.status) < 600) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  // Fallback 500
  return res.status(500).json({ success: false, message: err.message || "Server error" });
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("Server running on PORT:", PORT);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

startServer();

export default app;
