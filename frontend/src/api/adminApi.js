// src/api/adminApi.js
import api from "./axiosSetup";

// Admin login (first step) -> returns { success, loginToken, message, ... }
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Admin login error:", error);
    // normalize thrown error so frontend catch can show friendly message
    throw error.response?.data || { message: error.message || "Login failed" };
  }
};

// Verify login code (OTP) -> expects { loginToken, code } and returns { success, token, message, user? }
export const verifyLoginCode = async (payload) => {
  try {
    const response = await api.post("/admin/login/authentication", payload);
    return response.data;
  } catch (error) {
    console.error("Verify login code error:", error);
    throw error.response?.data || { message: error.message || "Verification failed" };
  }
};

// Get Admin Profile (protected)
export const fetchAdminProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw { message: "No token found" };

    const response = await api.get("/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetch admin profile error:", error);
    throw error.response?.data || { message: error.message || "Failed to fetch admin profile" };
  }
};

export default {
  loginAdmin,
  verifyLoginCode,
  fetchAdminProfile,
};
