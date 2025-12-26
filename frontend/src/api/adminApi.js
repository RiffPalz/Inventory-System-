import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: backendUrl,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach Authorization header using adminAccessToken if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("adminAccessToken");
      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization && !config.headers.authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore localStorage errors
      // console.warn("adminApi interceptor error:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to normalize errors
const normalizeError = (err) => {
  if (!err) return { message: "Unknown error" };
  if (err.response && err.response.data) {
    const d = err.response.data;
    return { message: d.message || d.error || JSON.stringify(d) };
  }
  return { message: err.message || "Network error" };
};

// Login (no OTP) -> returns { success, admin, accessToken, refreshToken, raw }
export const loginAdmin = async (credentials) => {
  try {
    const res = await api.post("/api/admin/login", credentials);
    const data = res.data || {};

    return {
      success: true,
      admin: data.admin ?? null,
      accessToken: data.accessToken ?? data.token ?? null,
      refreshToken: data.refreshToken ?? null,
      raw: data,
    };
  } catch (err) {
    throw normalizeError(err);
  }
};

// Fetch admin profile (protected)
export const fetchAdminProfile = async () => {
  try {
    const res = await api.get("/api/admin/me");
    // return whatever backend returns (controller returns { admin })
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

// Optional helper to set tokens programmatically
export const setAccessToken = (token) => {
  if (token) localStorage.setItem("adminAccessToken", token);
  else localStorage.removeItem("adminAccessToken");
};
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem("adminRefreshToken", token);
  else localStorage.removeItem("adminRefreshToken");
};

export default {
  loginAdmin,
  fetchAdminProfile,
  setAccessToken,
  setRefreshToken,
};
