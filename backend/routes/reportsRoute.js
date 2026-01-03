import express from "express";
import { getMonthlySales } from "../services/reportsService.js";

const router = express.Router();

/**
 * GET /api/reports/monthly-sales
 * ?month=12&year=2025
 */
router.get("/monthly-sales", async (req, res) => {
  try {
    const report = await getMonthlySales(req.query);
    res.status(200).json(report);
  } catch (err) {
    console.error("Monthly Sales Report Error:", err);
    res.status(500).json({
      message: "Failed to load monthly sales report",
    });
  }
});

export default router;
