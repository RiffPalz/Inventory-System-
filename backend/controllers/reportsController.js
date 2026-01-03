import { Op, fn, col } from "sequelize";
import Sale from "../models/monthlySales.js";

export const getMonthlySalesReport = async (req, res) => {
  try {
    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1; // 1–12
    const year =
      Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await Sale.findOne({
      attributes: [
        [fn("SUM", col("totalAmount")), "totalSalesValue"],
        [fn("SUM", col("quantity")), "totalUnitsSold"],
        [fn("COUNT", col("id")), "transactionCount"],
      ],
      where: {
        transactionDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      raw: true,
    });

    res.json({
      month,
      year,
      totalSalesValue: Number(result.totalSalesValue || 0),
      totalUnitsSold: Number(result.totalUnitsSold || 0),
      transactionCount: Number(result.transactionCount || 0),
    });
  } catch (err) {
    console.error("Monthly Sales Report Error:", err);
    res.status(500).json({ message: "Failed to load monthly sales report" });
  }
};
