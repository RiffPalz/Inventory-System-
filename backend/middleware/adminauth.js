import jwt from "jsonwebtoken";
import Admin from "../models/admin.js"; 

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing header" });
    }

    // Expect header like "Bearer eyJ..."
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid header format" });
    }

    const token = parts[1];

    // Verify token using the specific secret key used for signing
    const secret = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET || "changeme";
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      // token invalid or expired signature
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token signature" });
    }

    // payload should contain the admin's ID (signed as 'id' in token.js)
    const adminId = payload.id ?? payload.adminId ?? payload.userId ?? null;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token missing ID" });
    }

    // fetch admin from DB using the ID found in the token
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin account not found" });
    }

    // attach sanitized admin object to req for controller use
    req.admin = {
      id: admin.id,
      userName: admin.userName,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (err) {
    console.error("adminAuth error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default adminAuth;