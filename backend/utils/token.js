import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAdminToken = (admin) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in environment variables");
    }

    const payload = {
        id: admin.id,
        email: admin.emailAddress,
        role: admin.role || "admin",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "7d",
    });
};

export const generateLoginToken = () =>
    crypto.randomBytes(32).toString("hex");

export const generatePasswordResetToken = () =>
    crypto.randomBytes(32).toString("hex");

export default {
    createAdminToken,
    generateLoginToken,
    generatePasswordResetToken,
};
