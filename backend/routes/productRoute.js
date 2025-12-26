// routes/productRoutes.js
import express from "express";
import {
  createProductController,
  getProductController,
  listProductsController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/adminauth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Helper middleware: only run multer when request is multipart/form-data.
// If request is JSON (application/json) we skip multer so req.body stays populated.
const optionalUploadSingle = (fieldName = "image") => (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (req.is && req.is("application/json")) return next();
  if (contentType.startsWith("multipart/form-data")) {
    return upload.single(fieldName)(req, res, next);
  }
  // If content-type absent or something else (e.g. text/plain), just continue
  return next();
};

// Create product — accepts JSON or form-data (with optional single image field "image")
router.post("/", verifyToken, optionalUploadSingle("image"), createProductController);

// Public list & get
router.get("/", listProductsController);
router.get("/:id", getProductController);

// Update product — accepts JSON or form-data (with optional single image field "image")
router.put("/:id", verifyToken, optionalUploadSingle("image"), updateProductController);

// Delete
router.delete("/:id", verifyToken, deleteProductController);

export default router;
