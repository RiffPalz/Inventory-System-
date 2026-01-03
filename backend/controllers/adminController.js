import adminServices from "../services/adminService.js";

/**
 * POST /api/admin/register
 * body: { userName, emailAddress, password, phoneNumber?, role?, images? }
 */
export const registerAdminController = async (req, res) => {
  try {
    const payload = req.body || {};
    const admin = await adminServices.registerAdmin(payload);
    return res.status(201).json({ message: "Admin created", admin });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
};

/**
 * POST /api/admin/login
 * body: { emailAddress, password }
 * returns { admin, accessToken, refreshToken }
 */
export const loginAdminController = async (req, res) => {
  try {
    const { emailAddress, password } = req.body || {};
    if (!emailAddress || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const { admin, accessToken, refreshToken } = await adminServices.loginAdmin(
      emailAddress,
      password
    );

    return res.status(200).json({
      message: "Login successful",
      admin,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
};

/**
 * POST /api/admin/logout
 * Protected route — requires verifyToken middleware that sets req.admin
 * body: none
 */
export const logoutAdminController = async (req, res) => {
  try {
    const adminId = (req.admin && req.admin.id) || (req.user && req.user.id);
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    await adminServices.logoutAdmin(adminId);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Logout failed" });
  }
};

/**
 * POST /api/admin/refresh
 * body: { refreshToken } OR header: x-refresh-token
 * returns { admin, accessToken, refreshToken }
 */
export const refreshTokenController = async (req, res) => {
  try {
    const oldRefreshToken = req.body?.refreshToken || req.headers["x-refresh-token"];
    if (!oldRefreshToken) return res.status(400).json({ message: "Refresh token required" });

    const { admin, accessToken, refreshToken } = await adminServices.refreshAccessToken(
      oldRefreshToken
    );

    return res.status(200).json({
      message: "Token refreshed",
      admin,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    // treat refresh failures as unauthorized
    return res.status(401).json({ message: err.message || "Could not refresh token" });
  }
};

/**
 * GET /api/admin/me
 * Protected route — requires verifyToken middleware that sets req.admin
 */
export const getMeController = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    return res.status(200).json({ admin });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/profile
 * Protected route — requires verifyToken middleware that sets req.admin
 * Accepts multipart/form-data with single file field "image", or JSON body with imageUrl
 * Body fields: userName?, phoneNumber?, password?, imageUrl?, replaceImageIndex?
 */
export const updateProfileController = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    let imageUrl = null;
    if (req.file && req.file.filename) imageUrl = `/uploads/${req.file.filename}`;
    if (req.body?.imageUrl) imageUrl = req.body.imageUrl;

    const payload = {
      userName: req.body?.userName,
      phoneNumber: req.body?.phoneNumber,
      password: req.body?.password,
      imageUrl,
      replaceImageIndex:
        req.body?.replaceImageIndex !== undefined && req.body.replaceImageIndex !== null
          ? Number(req.body.replaceImageIndex)
          : null,
    };

    const updated = await adminServices.updateAdminProfile(adminId, payload);
    return res.status(200).json({ message: "Profile updated", admin: updated });
  } catch (err) {
    console.error("updateProfileController error:", err);
    return res.status(400).json({ message: err.message || "Update failed" });
  }
};
