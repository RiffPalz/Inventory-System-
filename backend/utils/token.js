import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAdminToken = (admin) => {
  if (!process.env.JWT_SECRET_ADMIN) {
    throw new Error("Missing JWT_SECRET_ADMIN in environment variables");
  }

  const payload = {
    id: admin.id || admin._id,
    email: admin.emailAddress,
    role: "admin",
  };

  return jwt.sign(payload, process.env.JWT_SECRET_ADMIN, {
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
