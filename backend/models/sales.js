import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Product from "./product.js"; 

const Sales = sequelize.define(
    "Sales",
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        productId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'products',
                key: 'ID' // Ensure this matches exactly uppercase ID in products.js
            }
        },
        productName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED, // Match unsigned if possible
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "sales",
        timestamps: true,
    }
);

// Define Association
Sales.belongsTo(Product, { foreignKey: 'productId', targetKey: 'ID' });

export default Sales;