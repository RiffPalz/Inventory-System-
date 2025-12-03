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

    userName: {
      type: DataTypes.STRING(255),
      allowNull: false,
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