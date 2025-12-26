import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // adjust path if needed

const Admin = sequelize.define(
  "Admin",
  {
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

    phoneNumber: {
      type: DataTypes.CHAR(11),
      field: "phoneNumber",
      allowNull: true,
      validate: {
        is: /^[0-9]{11}$/,
      },
    },

    emailAddress: {
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
    timestamps: true,
    createdAt: "createAt",
    updatedAt: "updateAt",
  }
);

export default Admin;
