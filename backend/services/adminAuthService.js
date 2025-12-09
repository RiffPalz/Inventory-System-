import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import { sequelize } from '../config/database.js';
const { fn, col } = sequelize; 

import { generateLoginToken, createAdminToken, generateVerificationCode } from "../utils/token.js";
import { sendMail } from "../utils/mailer.js";
import { adminVerifyCode } from "../utils/emailLayout.js";
import { validateEmail } from "../validators/adminValidator.js";


//Register Admin Service
export const registerAdminService = async (emailAddress, password) => {
  try {
    if (!emailAddress || !password) {
      return { success: false, message: "All fields (Email and Password) are required." };
    }

    const cleanEmail = typeof validateEmail === "function" ? validateEmail(emailAddress) : emailAddress.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: "Please provide a valid email address." };

    // Check if admin already exists using the JS property 'email'
    const existingAdmin = await Admin.findOne({ where: { email: cleanEmail } });
    if (existingAdmin) {
      return { success: false, message: "An admin with this email already exists." };
    }

    // Provide a default userName from the email
    const defaultUserName = cleanEmail.split('@')[0];

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new admin
    const newAdmin = await Admin.create({
        userName: defaultUserName, 
        email: cleanEmail, // FIXED: Using 'email' (JS property)
        password: hashedPassword,
        role: 'admin' 
    });

    if (!newAdmin) {
        return { success: false, message: "Failed to create admin account." };
    }

    return { 
        success: true, 
        message: "Admin account registered successfully.",
        admin: { ID: newAdmin.ID, email: newAdmin.email } 
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

    // find admin by email (case-insensitive) - Targets DB column 'emailAddress'
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
        to: admin.email, // FIXED: Using 'admin.email' (JS property)
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
    // 🔑 FIX: Pass the full 'admin' object so token.js can access admin.id and admin.email
    const token = createAdminToken(admin); 

    return { success: true, message: "Login successful!", token };
  } catch (error) {
    console.error("loginCodeVerifyService error:", error);
    return { success: false, message: "Server error during verification." };
  }
};


export default { loginAdminService, loginCodeVerifyService, registerAdminService };