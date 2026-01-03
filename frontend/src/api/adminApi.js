import axios from "axios";

/**
 * Backend base URL
 */
const BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: `${BACKEND}/api/admin`,
  withCredentials: false,
});

/**
 * Attach JWT automatically to every request
 * Uses ONE standard key: "token"
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Normalize API responses
 */
const unwrap = (res) => res?.data ?? res;

/**
 * ===============================
 * ADMIN AUTH API
 * ===============================
 */
const adminApi = {
  /**
   * Login Admin
   */
  async loginAdmin(payload) {
    const res = await api.post("/login", payload);
    return unwrap(res);
  },

  /**
   * Get current admin profile (optional future use)
   */
  async getProfile() {
    const res = await api.get("/profile");
    return unwrap(res);
  },

  /**
   * Logout Admin
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminProfile");
  },
};

export default adminApi;
