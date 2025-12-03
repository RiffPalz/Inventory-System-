// routes/productRoute.js
import express from "express";
import adminAuth from "../middleware/adminauth.js";
import ProductController from "../controllers/productController.js";
import upload from "../middleware/upload.js"; 

const productRouter = express.Router();

// Protect all product routes with adminAuth
productRouter.use(adminAuth);

// Create product
productRouter.post("/", ProductController.createProduct);

// List products (supports pagination, search, filters)
productRouter.get("/", ProductController.listProducts);

// Get single product by id
productRouter.get("/:id", ProductController.getProductById);

// Update product by id
productRouter.put("/:id", ProductController.updateProduct);

// Delete product by id
productRouter.delete("/:id", ProductController.deleteProduct);

// UPLOAD IMAGES - NEW
productRouter.post(
  "/:id/images",
  upload.array("images", 10),
  ProductController.uploadImages
);

export default productRouter;
