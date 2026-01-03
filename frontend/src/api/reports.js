import axios from "axios";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// ===============================
// MONTHLY SALES SUMMARY
// ===============================
export const getMonthlySalesSummary = async (month, year) => {
  const res = await axios.get(`${BACKEND}/api/reports/monthly-sales`, {
    params: { month, year },
  });
  return res.data;
};

// ===============================
// MONTHLY SALES LIST (DETAILS)
// ===============================
export const getMonthlySalesList = async (month, year) => {
  const res = await axios.get(`${BACKEND}/api/sales`, {
    params: { month, year },
  });
  return res.data;
};

// ===============================
// RESTOCK SUMMARY
// ===============================
export const getRestockSummary = async () => {
  const res = await axios.get(`${BACKEND}/api/products`, {
    params: { limit: 1000 },
  });

  const products = res.data?.data || [];
  return products.filter((p) => Number(p.inStock) <= 10);
};
