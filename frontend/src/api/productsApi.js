import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: backendUrl,
  // NOTE: Default content type is application/json. We will override this for FormData requests.
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

// Helper to build FormData for requests that include an image file
const buildFormData = (item, imageFile) => {
  const formData = new FormData();
  
  for (const key in item) {
    // We only append non-null/non-undefined scalar values to FormData
    if (item[key] !== undefined && item[key] !== null && typeof item[key] !== 'object') {
      formData.append(key, item[key]);
    }
  }
  
  if (imageFile) {
    // 'image' must match the field name used in the backend middleware (optionalUploadSingle("image"))
    formData.append('image', imageFile);
  }
  return formData;
};

const PRODUCT_API_ENDPOINT = "/api/products";

// --- API Functions ---

/**
 * Lists products from the backend.
 * @param {object} opts - Query options (page, limit, search, category, etc.)
 * @returns {Promise<object>} - { meta, data: products[] }
 */
export const listProducts = async (opts = {}) => {
  try {
    const res = await api.get(PRODUCT_API_ENDPOINT, { params: opts });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

/**
 * Creates a new product.
 * @param {object} item - Product data (name, sku, stock, etc.)
 * @param {File | null} imageFile - The file object to upload.
 * @returns {Promise<object>} - The created product object.
 */
export const createProduct = async (item, imageFile) => {
  try {
    const data = buildFormData(item, imageFile);
    
    // Override Content-Type header to ensure browser sets it correctly for multipart data
    const res = await api.post(PRODUCT_API_ENDPOINT, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.product;
  } catch (err) {
    throw normalizeError(err);
  }
};

/**
 * Updates an existing product.
 * @param {string | number} id - The ID of the product to update.
 * @param {object} item - Product updates (name, sku, stock, etc.)
 * @param {File | null} imageFile - The new image file object (optional).
 * @returns {Promise<object>} - The updated product object.
 */
export const updateProduct = async (id, item, imageFile) => {
  try {
    const data = buildFormData(item, imageFile);
    
    // Override Content-Type header for multipart data
    const res = await api.put(`${PRODUCT_API_ENDPOINT}/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.product;
  } catch (err) {
    throw normalizeError(err);
  }
};

/**
 * Deletes a product.
 * @param {string | number} id - The ID of the product to delete.
 * @returns {Promise<object>} - Deletion response message.
 */
export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`${PRODUCT_API_ENDPOINT}/${id}`);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};