import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/database.js";

import adminRoutes from "./routes/adminRoute.js";
import productRoutes from "./routes/productRoute.js";
import salesRoute from "./routes/salesRoute.js";
import reportsRoute from "./routes/reportsRoute.js";
import notificationRoute from "./routes/notificationRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

/* ===================== HTTP SERVER ===================== */
const server = http.createServer(app);

/* ===================== SOCKET.IO ===================== */
export const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 change to frontend URL in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Admin joins own room
  socket.on("join-admin", (adminId) => {
    socket.join(`admin-${adminId}`);
    console.log(`👤 Admin ${adminId} joined room admin-${adminId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* ===================== MIDDLEWARES ===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== TEST API ===================== */
app.get("/", (req, res) => res.send("API working"));

/* ===================== ROUTES ===================== */
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoute);
app.use("/api/reports", reportsRoute);
app.use("/api/notifications", notificationRoute);

/* ===================== STATIC FILES ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================== 404 HANDLER ===================== */
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

/* ===================== GLOBAL ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

/* ===================== START SERVER ===================== */
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB connection error:", error);
    process.exit(1);
  }
};

startServer();
