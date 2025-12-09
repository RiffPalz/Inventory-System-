import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or malformed token.",
      });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET_ADMIN;
    if (!secret) {
      console.error("❌ Missing JWT_SECRET_ADMIN in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error (missing JWT secret).",
      });
    }

    const decoded = jwt.verify(token, secret);

    // Ensure this token belongs to an admin
    if (!decoded.role || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access only.",
      });
    }

    // Attach admin info to request
    req.admin = {
      id: decoded.id,      // use lowercase "id" consistently
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default adminAuth;