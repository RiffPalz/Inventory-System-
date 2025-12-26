import express from "express";
import salesController from "../controllers/salesController.js";

const router = express.Router();

router.post("/", salesController.createSale);
router.get("/", salesController.getAllSales);
router.get("/:id", salesController.getSaleById);

export default router;
