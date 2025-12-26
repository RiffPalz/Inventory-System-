// backend/services/adminService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import { createAdminToken, generateLoginToken } from "../utils/token.js";

const adminSafe = (admin) => {
  if (!admin) return null;

  let images = [];
  try {
    images = admin.images ? JSON.parse(admin.images) : [];
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }

  return {
    id: admin.id,
    userName: admin.userName,
    emailAddress: admin.emailAddress,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
    images,
    createAt: admin.createAt,
    updateAt: admin.updateAt,
  };
};

export default {
  async registerAdmin({ userName, emailAddress, password, phoneNumber = null, role = "admin", images = null }) {
    if (!emailAddress || !password) throw new Error("Email and password are required.");

    const exists = await Admin.findOne({ where: { emailAddress } });
    if (exists) throw new Error("Email already in use.");

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      userName,
      emailAddress,
      password: hashed,
      phoneNumber,
      role,
      images,
    });

    return adminSafe(admin);
  },

  async loginAdmin(emailAddress, password) {
    const admin = await Admin.findOne({ where: { emailAddress } });
    if (!admin) throw new Error("Invalid email or password.");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    // create access token (JWT)
    const accessToken = createAdminToken(admin);

    // create a secure random refresh token (opaque value)
    const refreshToken = generateLoginToken();

    // store tokens (access token stored server-side too for optional invalidation)
    admin.loginToken = accessToken;
    admin.refreshToken = refreshToken;
    await admin.save();

    return {
      admin: adminSafe(admin),
      accessToken,
      refreshToken,
    };
  },

  async logoutAdmin(adminId) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error("Admin not found.");

    admin.loginToken = null;
    admin.refreshToken = null;
    await admin.save();

    return { message: "Logged out" };
  },

  async refreshAccessToken(oldRefreshToken) {
    if (!oldRefreshToken) throw new Error("No refresh token provided.");

    const admin = await Admin.findOne({ where: { refreshToken: oldRefreshToken } });
    if (!admin) throw new Error("Invalid refresh token. Please login again.");

    const newAccessToken = createAdminToken(admin);
    const newRefreshToken = generateLoginToken();

    admin.loginToken = newAccessToken;
    admin.refreshToken = newRefreshToken;
    await admin.save();

    return {
      admin: adminSafe(admin),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  // verifies JWT and returns sanitized admin or null
  async getAdminFromAccessToken(accessToken) {
    if (!accessToken) return null;
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("Missing JWT_SECRET environment variable");
        return null;
      }

      const decoded = jwt.verify(accessToken, secret);
      if (!decoded?.id) return null;

      const admin = await Admin.findByPk(decoded.id);
      if (!admin) return null;

      return adminSafe(admin);
    } catch (err) {
      console.error("getAdminFromAccessToken error:", err.message || err);
      return null;
    }
  },

  async updateAdminProfile(adminId, { userName, phoneNumber, password, imageUrl, replaceImageIndex = null }) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error("Admin not found.");

    if (phoneNumber && !/^[0-9]{11}$/.test(phoneNumber)) {
      throw new Error("phoneNumber must be 11 digits.");
    }

    if (userName !== undefined) admin.userName = userName;
    if (phoneNumber !== undefined) admin.phoneNumber = phoneNumber;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      admin.password = hashed;
    }

    let imagesArr = [];
    try {
      imagesArr = admin.images ? JSON.parse(admin.images) : [];
      if (!Array.isArray(imagesArr)) imagesArr = [];
    } catch {
      imagesArr = [];
    }

    if (imageUrl) {
      if (typeof replaceImageIndex === "number" && replaceImageIndex >= 0 && replaceImageIndex < imagesArr.length) {
        imagesArr[replaceImageIndex] = imageUrl;
      } else {
        imagesArr.unshift(imageUrl);
      }
      admin.images = JSON.stringify(imagesArr);
    }

    await admin.save();

    return {
      id: admin.id,
      userName: admin.userName,
      emailAddress: admin.emailAddress,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      images: imagesArr,
      createAt: admin.createAt,
      updateAt: admin.updateAt,
    };
  },
};
