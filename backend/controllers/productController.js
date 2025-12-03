import ProductService from "../services/productService.js"

/**
 * POST /products
 */
export const createProduct = async (req, res) => {
  try {
    const payload = req.body;
    const result = await ProductService.createProduct(payload);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("productController.createProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /products
 * Query params: page, limit, search, category, status, sortBy, sortDir
 */
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
    console.error("productController.listProducts error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const result = await ProductService.getProductById(id);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("productController.getProductById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const result = await ProductService.updateProduct(id, updates);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("productController.updateProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const result = await ProductService.deleteProduct(id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("productController.deleteProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};