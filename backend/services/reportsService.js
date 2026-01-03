import MonthlySales from "../models/monthlySales.js";
import { Op, fn, col } from "sequelize";

export const getMonthlySales = async ({ month, year }) => {
  const now = new Date();

  const selectedMonth = Number(month) || now.getMonth() + 1;
  const selectedYear = Number(year) || now.getFullYear();

  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 1);

  const result = await MonthlySales.findOne({
    attributes: [
      [fn("COALESCE", fn("SUM", col("totalAmount")), 0), "totalSalesValue"],
      [fn("COALESCE", fn("SUM", col("quantity")), 0), "totalUnitsSold"],
      [fn("COUNT", col("id")), "transactionCount"],
    ],
    where: {
      transactionDate: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    raw: true,
  });

  return {
    month: selectedMonth,
    year: selectedYear,
    totalSalesValue: Number(result.totalSalesValue),
    totalUnitsSold: Number(result.totalUnitsSold),
    transactionCount: Number(result.transactionCount),
  };
};
