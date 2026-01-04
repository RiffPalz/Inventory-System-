import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Helper to get token for authorized requests
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMonthlySalesSummary = async (month, year) => {
  const now = new Date();
  const res = await axios.get(`${BACKEND}/api/reports/monthly-sales`, {
    params: { 
        month: month || now.getMonth() + 1, 
        year: year || now.getFullYear() 
    },
    headers: getAuthHeaders(), // Added authentication to get full admin data
  });
  return res.data;
};

// ADD 'export' TO THIS FUNCTION
export const getMonthlySalesList = async (month, year) => {
  const res = await axios.get(`${BACKEND}/api/sales`, {
    params: { month, year },
    headers: getAuthHeaders(), // Added authentication
  });
  return res.data;
};

export const getRestockSummary = async () => {
  const res = await axios.get(`${BACKEND}/api/products`, {
    params: { limit: 1000 },
    headers: getAuthHeaders(),
  });
  const products = res.data?.data || [];
  return products.filter((p) => Number(p.inStock) <= 10);
};