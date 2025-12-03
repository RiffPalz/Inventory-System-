import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import { sequelize } from '../config/database.js';
const { fn, col } = sequelize; 

import { generateLoginToken, createAdminToken, generateVerificationCode } from "../utils/token.js";
import { sendMail } from "../utils/mailer.js";
import { adminVerifyCode } from "../utils/emailLayout.js";
import { validateEmail } from "../validators/adminValidator.js";


//Register Admin Service
export const registerAdminService = async (emailAddress, password, userName) => {
  try {
    if (!emailAddress || !password || !userName) {
      return { success: false, message: "All fields (email, password, username) are required." };
    }

    // Input validation (optional, depending on where you handle it)
    const cleanEmail = typeof validateEmail === "function" ? validateEmail(emailAddress) : emailAddress.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: "Please provide a valid email address." };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { emailAddress: cleanEmail } });
    if (existingAdmin) {
      return { success: false, message: "An admin with this email already exists." };
    }

    // 🔑 Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 💾 Create and save the new admin
    const newAdmin = await Admin.create({
      emailAddress: cleanEmail,
      userName: userName,
      password: hashedPassword,
      role: 'admin' // Default role as 'admin'
    });

    if (!newAdmin) {
        return { success: false, message: "Failed to create admin account." };
    }

    // Optionally generate a token or send a welcome email here
    return { 
        success: true, 
        message: "Admin account registered successfully.",
        admin: { ID: newAdmin.ID, userName: newAdmin.userName, emailAddress: newAdmin.emailAddress } 
    };

  } catch (error) {
    console.error("registerAdminService error:", error);
    return { success: false, message: "Server error during admin registration." };
  }
};

// Login Admin Service
export const loginAdminService = async (emailAddress, password) => {
  try {
    if (!emailAddress || !password) {
      return { success: false, message: "Email and password are required." };
    }

    // Ensure email normalized
    const cleanEmail = typeof validateEmail === "function" ? validateEmail(emailAddress) : emailAddress.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: "Please provide a valid email address." };

    // find admin by email (case-insensitive)
    const admin = await Admin.findOne({
      where: sequelize.where(fn("LOWER", col("emailAddress")), cleanEmail.toLowerCase()),
    });

    if (!admin) {
      return { success: false, message: "Your account is incorrect, please try again" };
    }

    // ensure password exists
    if (!admin.password) {
      return { success: false, message: "Your password is incorrect, please try again" };
    }

    // bcrypt compare
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return { success: false, message: "Both is incorrect, please try again" };
    }

    // generate login token and OTP
    const loginToken = generateLoginToken();
    const code = generateVerificationCode();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await admin.update({
      verificationCode: code,
      codeExpiresAt: expirationTime,
      loginToken,
    });

    // send OTP email using your layout
    const html = typeof adminVerifyCode === "function" ? adminVerifyCode(code) : `<p>Your verification code is <b>${code}</b></p>`;
    await sendMail({ 
        to: admin.emailAddress, 
        subject: "Login Verification Code", 
        html,
    });

    return {
      success: true,
      message: "Verification code sent. Please enter the code to complete login.",
      loginToken,
    };
  } catch (error) {
    console.error("loginAdminService error:", error);
    return { success: false, message: "Server error during login." };
  }
};

// Verify Login Code Service
export const loginCodeVerifyService = async (loginToken, code) => {
  try {
    if (!loginToken || !code) {
      return {
        success: false,
        message:
          "Verification failed. Login session or verification code may have expired. Please try logging in again.",
      };
    }

    const admin = await Admin.findOne({ where: { loginToken } });
    if (!admin) {
      return { success: false, message: "Expired login session. Please log in again." };
    }

    if (admin.verificationCode !== code) {
      return { success: false, message: "Invalid verification code." };
    }

    if (!admin.codeExpiresAt || new Date() > new Date(admin.codeExpiresAt)) {
      await admin.update({ verificationCode: null, codeExpiresAt: null, loginToken: null });
      return { success: false, message: "Verification code expired. Please log in again.", codeExpired: true };
    }

    // Clear temporary fields
    await admin.update({ verificationCode: null, codeExpiresAt: null, loginToken: null });

    // Create permanent JWT
    const token = createAdminToken({ ID: admin.ID, role: admin.role, userName: admin.userName });

    return { success: true, message: "Login successful!", token };
  } catch (error) {
    console.error("loginCodeVerifyService error:", error);
    return { success: false, message: "Server error during verification." };
  }
};


export default { loginAdminService, loginCodeVerifyService, registerAdminService };