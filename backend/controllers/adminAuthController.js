import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js"; 
import { 
  loginAdminService, 
  loginCodeVerifyService, 
  registerAdminService 
} from "../services/adminAuthService.js";


const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || process.env.SECRET || "changeme";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

export const loginAdmin = async (req, res) => {
  try {
    const emailAddress = req.body?.email ?? req.body?.emailAddress ?? req.body?.Email ?? null;
    const password = req.body?.password ?? req.body?.pass ?? null;

    const result = await loginAdminService(emailAddress, password);
    
    if (!result.success) {
      const status = (result.message.includes("required")) ? 400 : 401;
      return res.status(status).json(result);
    }
    
    return res.json({
      success: true,
      message: result.message,
      data: { loginToken: result.loginToken },
    });

  } catch (err) {
    console.error("loginAdmin error:", err);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};


export const loginCode = async (req, res) => {
  try {
    const { loginToken, code } = req.body;

    const result = await loginCodeVerifyService(loginToken, code);

    if (!result.success) {
      const status = (result.codeExpired) ? 401 : 400;
      return res.status(status).json(result);
    }

    return res.json({
      success: true,
      message: result.message,
      data: { token: result.token },
    });

  } catch (err) {
    console.error("loginCode error:", err);
    return res.status(500).json({ success: false, message: "Server error during verification." });
  }
};


export const registerAdmin = async (req, res) => {
  try {
    const emailAddress = req.body?.email ?? req.body?.emailAddress;
    const password = req.body?.password;

    const result = await registerAdminService(emailAddress, password);

    if (!result.success) {
      const status = (result.message.includes("required")) ? 400 : 409; 
      return res.status(status).json(result);
    }

    return res.status(201).json(result); 

  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
};


export default { loginAdmin, loginCode, registerAdmin };