// models/admin.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // adjust path if needed

const Admin = sequelize.define(
  "Admin",
  {
    // JS-friendly primary key 'id' mapped to DB column 'ID'
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "ID",
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    // images stored as JSON string in TEXT column
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Image URLs stored as a stringified array",
    },

    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Keep DB column name phoneNumber but expose as 'phone' in JS
    phone: {
      type: DataTypes.CHAR(11),
      field: "phoneNumber",
      allowNull: true,
      validate: {
        is: /^[0-9]{11}$/,
      },
    },

    // Keep DB column name emailAddress but expose as 'email' in JS
    email: {
      type: DataTypes.STRING(255),
      field: "emailAddress",
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    verificationCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    codeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    loginToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    tableName: "admin",
    // map sequelize timestamps to your DB columns (createAt, updateAt)
    timestamps: true,
    createdAt: "createAt",
    updatedAt: "updateAt",
  }
);

export default Admin;
