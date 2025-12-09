import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAdminToken = (admin) => {
  // Check for the specific secret name used in your environment/middleware
  if (!process.env.JWT_SECRET_ADMIN) {
    // If JWT_SECRET_ADMIN is missing, throw an error
    throw new Error("Missing JWT_SECRET_ADMIN in environment variables");
  }

  const payload = {
    // FIXED: Rely on the consistent Sequelize JS property 'id' (lowercase)
    // This ensures the payload always contains a valid ID if the object is passed correctly.
    id: admin.id, 
    // FIXED: Rely on the consistent Sequelize JS property 'email' (lowercase)
    email: admin.email,
    role: "admin",
  };

  // Use JWT_SECRET for signing, assuming your verification middleware uses this generic name
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

export const generateLoginToken = () =>
  crypto.randomBytes(32).toString("hex");

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generatePasswordResetToken = () =>
  crypto.randomBytes(32).toString("hex");

export default {
  createAdminToken,
  generateLoginToken,
  generateVerificationCode,
  generatePasswordResetToken,
};