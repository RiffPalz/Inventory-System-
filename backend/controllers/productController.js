import ProductService from "../services/productService.js";
import Product from "../models/product.js";
import path from "path";

// ===========================
// CREATE PRODUCT
// ===========================
export const createProduct = async (req, res) => {
  try {
    const payload = req.body;
    const result = await ProductService.createProduct(payload);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// LIST PRODUCTS
// ===========================
export const listProducts = async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      category: req.query.category,
      status: req.query.status,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir,
    };

    const result = await ProductService.listProducts(options);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("listProducts error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// GET PRODUCT BY ID
// ===========================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductService.getProductById(id);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// UPDATE PRODUCT
// ===========================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await ProductService.updateProduct(id, updates);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// DELETE PRODUCT
// ===========================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ProductService.deleteProduct(id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// UPLOAD IMAGES
// ===========================
export const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded." });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Convert file paths → full URLs
    const newImages = req.files.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        file.path
      )}`;
    });

    const existing = Array.isArray(product.images)
      ? product.images
      : product.images || [];

    product.images = [...existing, ...newImages];

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      data: {
        images: product.images,
      },
    });
  } catch (err) {
    console.error("uploadImages error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error uploading images." });
  }
};

// ===========================
// EXPORT ALL CONTROLLERS
// ===========================
export default {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadImages,
};
