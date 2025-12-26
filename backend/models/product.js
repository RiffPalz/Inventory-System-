import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const setStockStatus = (product) => {
  const storeStock = Number(product.inStock) || 0;

  if (storeStock <= 0) {
    product.status = "out of stock";
  } else if (storeStock <= 10) {
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

    images: {
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

    // Warehouse stock (where you store inventory)
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "Warehouse stock",
    },

    // Store stock (how many items currently in store / available for sale)
    inStock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "Store stock (quantity available in store)",
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
      beforeSave: (product) => {
        if (product.changed("inStock")) setStockStatus(product);
      }
    }

  }
);

export default Product;
