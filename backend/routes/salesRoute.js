import express from "express";
import salesController from "../controllers/salesController.js";
import { verifyToken } from "../middleware/adminAuth.js"; // Import your middleware

const router = express.Router();

// PROTECTED: Added verifyToken so req.admin.id is available for notifications
router.post("/", verifyToken, salesController.createSale);

// PUBLIC or PROTECTED: You can choose to protect these as well
router.get("/", verifyToken, salesController.getAllSales);
router.get("/:id", verifyToken, salesController.getSaleById);

export default router;