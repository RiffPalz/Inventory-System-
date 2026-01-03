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

const DASHBOARD_API_ENDPOINT = "/api/dashboard"; // Assuming your backend route for metrics is /api/dashboard

// --- API Functions ---

/**
 * Fetches key dashboard metrics (e.g., total products, low stock count, revenue snapshot).
 * @returns {Promise<object>} - Dashboard data object (e.g., { totalProducts: 100, lowStock: 5, totalRevenue: 50000 }).
 */
export const fetchDashboardSummary = async () => {
  try {
    const res = await api.get(DASHBOARD_API_ENDPOINT);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export default {
  fetchDashboardSummary,
};