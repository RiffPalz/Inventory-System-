import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const setStockStatus = (product) => {
  const stock = Number(product.stock) || 0;
  product.inStock = stock > 0;

  if (stock <= 0) {
    product.status = "out of stock";
  } else if (stock <= 10) {
    product.status = "low stock";
  } else {
    product.status = "in stock";
  }
};

const Product = sequelize.define(
  "Product",
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

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    category: {
      type: DataTypes.ENUM(
        "PC Case",
        "HDD",
        "SSD",
        "Fan",
        "Cooler",
        "RAM",
        "Motherboard",
        "Processor",
        "Graphics Card",
        "Power Supply Unit"
      ),
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "Total quantity available",
    },

    inStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Automatically switches false when stock is 0",
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    status: {
      type: DataTypes.ENUM("in stock", "low stock", "out of stock"),
      allowNull: false,
      defaultValue: "in stock",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    hooks: {
      beforeCreate: (product) => setStockStatus(product),
      beforeUpdate: (product) => setStockStatus(product),
      beforeSave: (product) => setStockStatus(product),
    },
  }
);

export default Product;