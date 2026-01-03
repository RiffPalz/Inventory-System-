import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: backendUrl,
});

/**
 * Global interceptor (works for JSON requests)
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
 * Explicit auth header helper
 * (IMPORTANT for multipart/form-data requests)
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Build FormData safely
 */
const buildFormData = (item, imageFile) => {
  const formData = new FormData();

  for (const key in item) {
    if (item[key] !== undefined && item[key] !== null) {
      formData.append(key, item[key]);
    }
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
};

const ENDPOINT = "/api/products";

/**
 * ===============================
 * API FUNCTIONS
 * ===============================
 */

// PUBLIC - No auth required
export const listProducts = (opts) =>
  api.get(ENDPOINT, { params: opts });

// CREATE (Protected, multipart-safe)
export const createProduct = (item, imageFile) => {
  const data = buildFormData(item, imageFile);
  return api.post(ENDPOINT, data, {
    headers: {
      ...getAuthHeaders(),
    },
  });
};

// UPDATE (Protected)
export const updateProduct = (id, item, imageFile) => {
  // JSON update (no image)
  if (!imageFile) {
    return api.put(`${ENDPOINT}/${id}`, item, {
      headers: getAuthHeaders(),
    });
  }

  // Multipart update (with image)
  const data = buildFormData(item, imageFile);
  return api.put(`${ENDPOINT}/${id}`, data, {
    headers: {
      ...getAuthHeaders(),
    },
  });
};

// DELETE (Protected)
export const deleteProduct = (id) =>
  api.delete(`${ENDPOINT}/${id}`, {
    headers: getAuthHeaders(),
  });

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
