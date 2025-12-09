import { fetchProfileService, updateProfileService } from "../services/adminProfileService.js";

// Helper to get admin id from req.admin
const getAdminIdFromReq = (req) => {
  return req.admin?.id ?? null; 
};

/**
 * GET /admin/profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = getAdminIdFromReq(req);
    if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Call the service layer
    const adminData = await fetchProfileService(adminId);

    if (!adminData) return res.status(404).json({ success: false, message: "Admin not found" });

    return res.json({ success: true, data: adminData });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching profile." });
  }
};

/**
 * PUT /admin/profile
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = getAdminIdFromReq(req);
    if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const updates = req.body; 

    // Call the service layer to perform validation, hashing, and database save
    const updatedAdmin = await updateProfileService(adminId, updates);

    // On success, return the cleaned updated data
    return res.json({ success: true, message: "Profile updated.", data: updatedAdmin });
  } catch (err) {
    console.error("updateAdminProfile error:", err.message);
    
    // Specifically handle errors thrown by the service
    if (err.message.includes("Admin not found")) {
        return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (err.message.includes("No valid fields") || err.message.includes("Invalid phone number format")) {
        return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: "Server error updating profile." });
  }
};


export default { getAdminProfile, updateAdminProfile };