import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Helper to get the token from localStorage
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all sales
 */
export const listSales = async () => {
  // Added headers to prevent 401
  const response = await axios.get(`${BACKEND_URL}/api/sales`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Create a new sale
 */
export const createSale = async (saleData) => {
  // Added headers to prevent 401
  const response = await axios.post(
    `${BACKEND_URL}/api/sales`,
    saleData,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};