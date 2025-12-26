import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { connectDB } from "./config/database.js";


import adminRoutes from "./routes/adminRoute.js";
import productRoutes from "./routes/productRoute.js";
import salesRoute from "./routes/salesRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API
app.get("/", (req, res) => res.send("API working"));

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoute);



//uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

startServer();
