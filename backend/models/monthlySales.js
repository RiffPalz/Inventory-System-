import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const MonthlySales = sequelize.define(
  "MonthlySales",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },

    productId: {
      type: DataTypes.BIGINT,
    },

    productName: {
      type: DataTypes.STRING,
    },

    quantity: {
      type: DataTypes.INTEGER,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
    },

    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },

    transactionDate: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    tableName: "sales", // ✅ POINT TO EXISTING TABLE
    timestamps: false,  // reports only, no writes
  }
);

export default MonthlySales;
