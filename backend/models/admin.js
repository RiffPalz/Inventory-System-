import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Admin = sequelize.define(
  'Admin',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    
    images: { // Changed from 'image' to 'images' to match service logic
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
      allowNull: true,
      validate: {
        is: /^[0-9]{11}$/, // 11 digits only
      },
    },

    emailAddress: {
      type: DataTypes.STRING(255),
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

    createAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updateAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    },
  },
  {
    tableName: 'admin',
    timestamps: false,
  }
);

export default Admin;