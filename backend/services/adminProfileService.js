import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";

/**
 * Retrieves an admin profile, excluding the password hash.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Object>} The admin data or null.
 */
export const fetchProfileService = async (adminId) => {
  if (!adminId) return null;

  const admin = await Admin.findByPk(adminId, {
    // Exclude sensitive fields from the result
    attributes: { exclude: ["password", "verificationCode", "codeExpiresAt", "loginToken"] },
  });

  // sequelize returns an instance; convert to plain object
  return admin ? admin.toJSON() : null;
};

/**
 * Updates admin profile fields.
 * @param {string} adminId - The ID of the admin to update.
 * @param {Object} updates - An object containing fields to update (from frontend).
 * @returns {Promise<Object>} The updated and cleaned admin data.
 */
export const updateProfileService = async (adminId, updates) => {
  if (!adminId || !updates) throw new Error("Missing adminId or update data.");

  const admin = await Admin.findByPk(adminId);
  if (!admin) throw new Error("Admin not found.");

  const fieldsToUpdate = {};
  let passwordChanged = false;

  // Define the phone number regex based on the model's validation
  // Assuming the regex from admin.js: /^[0-9]{11}$/
  const phoneRegex = /^[0-9]{11}$/; 

  // --- 1. Map and Validate Fields ---
  
  if (typeof updates.userName === "string" && updates.userName.trim().length > 0) {
    fieldsToUpdate.userName = updates.userName.trim();
  }
  
  // Robust Phone Number Handling
  if (updates.hasOwnProperty("phoneNumber")) {
      const trimmedPhone = updates.phoneNumber?.trim();

      if (trimmedPhone === '') {
          // Allow clearing the phone number if sent as empty string (if DB allows NULL)
          fieldsToUpdate.phoneNumber = null; 
      } else if (typeof trimmedPhone === "string" && phoneRegex.test(trimmedPhone)) {
          // Valid 11-digit phone number
          fieldsToUpdate.phoneNumber = trimmedPhone;
      } else {
          // Phone number is present but invalid 
          throw new Error("Invalid phone number format. Must be exactly 11 digits or an empty string to clear.");
      }
  }
  
  if (updates.hasOwnProperty("images") && typeof updates.images === "string") {
    fieldsToUpdate.images = updates.images; // Expecting a stringified array or URL
  } else if (updates.hasOwnProperty("images") && updates.images === null) {
    fieldsToUpdate.images = null; // Allow clearing image field if null is sent
  }

  // Handle password update separately
  if (typeof updates.password === "string" && updates.password.length >= 8) {
    const salt = await bcrypt.genSalt(10);
    fieldsToUpdate.password = await bcrypt.hash(updates.password, salt);
    passwordChanged = true;
  }
  
  // --- 2. Check if any fields are valid for update ---
  if (Object.keys(fieldsToUpdate).length === 0 && !passwordChanged) {
      throw new Error("No valid fields provided for update.");
  }
  
  // --- 3. Update the record ---
  await admin.update(fieldsToUpdate);

  // --- 4. Return the updated, cleaned data ---
  const { password, ...cleanAdmin } = admin.toJSON();
  return cleanAdmin;
};

export default { fetchProfileService, updateProfileService };