import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Notification = sequelize.define(
    "Notification",
    {
        ID: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        adminId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },

        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "sale | stock | system",
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        referenceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            comment: "sales.ID or products.ID",
        },

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "notifications",
        updatedAt: false, // matches your SQL (no updatedAt column)
        timestamps: true,
    }
);

export default Notification;
