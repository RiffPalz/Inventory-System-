// controllers/adminAuthController.js
import {loginAdminService, loginCodeVerifyService, registerAdminService,} from "../services/adminAuthService.js";
import { validateEmail } from "../validators/adminValidator.js";


export const registerAdmin = async (req, res) => {
  try {
    const { emailAddress, password, userName } = req.body ?? {};

    // Basic required-field checks
    if (!emailAddress || !password || !userName) {
      return res.status(400).json({
        success: false,
        message: "emailAddress, password and userName are required.",
      });
    }

    // Validate email format (validator should return cleaned email or falsy)
    const cleanEmail = validateEmail(emailAddress);
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    // Basic password policy (adjust to your needs)
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Basic username sanitization/length check
    if (typeof userName !== "string" || userName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "userName must be at least 3 characters.",
      });
    }

    const result = await registerAdminService(cleanEmail, password, userName.trim());

    // If service creates resource, 201 on success
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("registerAdmin controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /admin/login
 */
export const loginAdmin = async (req, res) => {
  try {
    const { emailAddress: rawEmail, password } = req.body ?? {};

    if (!rawEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const cleanEmail = validateEmail(rawEmail);
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    const result = await loginAdminService(cleanEmail, password);

    // On auth failure service should return { success: false, message: "..." }
    // We return 200 for success, 401 for authentication failure
    return res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    console.error("loginAdmin controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const loginCode = async (req, res) => {
  try {
    const { loginToken, code } = req.body ?? {};

    if (!loginToken || !code) {
      return res.status(400).json({ success: false, message: "loginToken and code are required." });
    }

    const result = await loginCodeVerifyService(loginToken, code);

    return res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    console.error("loginCode controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    // If you used the adminAuth middleware from earlier, req.admin should exist
    const admin = req.admin ?? req.user ?? null;
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Option A: simply return the decoded token data
    return res.status(200).json({ success: true, data: admin });

    // Option B (recommended): fetch fresh admin data from DB using admin.id
    // const fullAdmin = await adminService.getById(admin.id);
    // return res.status(200).json({ success: true, data: fullAdmin });
  } catch (error) {
    console.error("getAdminProfile controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default { registerAdmin, loginAdmin, loginCode, getAdminProfile };
