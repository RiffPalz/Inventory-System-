import Sales from "../models/sales.js";
import Product from "../models/product.js";
import {
  createLowStockNotificationIfNeeded,
} from "./notificationService.js";

const LOW_STOCK_THRESHOLD = 10;

const createSale = async (data) => {
  // 1️⃣ FIND PRODUCT
  const product = await Product.findByPk(data.productId);
  if (!product) {
    throw new Error(`Product with ID ${data.productId} does not exist.`);
  }

  const quantitySold = Number(data.quantity);
  if (product.inStock < quantitySold) {
    throw new Error(`Insufficient stock. Available: ${product.inStock}`);
  }

  // 2️⃣ CREATE SALE
  const sale = await Sales.create({
    invoiceNumber: data.invoiceNumber,
    productId: data.productId,
    productName: product.name,
    quantity: quantitySold,
    price: Number(data.price),
    totalAmount: quantitySold * Number(data.price),
    transactionDate: data.transactionDate || new Date(),
  });

  // 3️⃣ DEDUCT STOCK
  product.inStock -= quantitySold;

  // 4️⃣ UPDATE PRODUCT STATUS
  if (product.inStock === 0) {
    product.status = "out of stock";
  } else if (product.inStock <= LOW_STOCK_THRESHOLD) {
    product.status = "low stock";
  } else {
    product.status = "in stock";
  }

  await product.save();

  // 5️⃣ LOW / OUT OF STOCK NOTIFICATION 🔔
  if (data.adminId) {
    await createLowStockNotificationIfNeeded({
      adminId: data.adminId,
      product,
    });
  }

  return sale;
};

const getAllSales = async () => {
  return await Sales.findAll({
    order: [["transactionDate", "DESC"]],
  });
};

const getSaleById = async (id) => {
  return await Sales.findByPk(id);
};

export default {
  createSale,
  getAllSales,
  getSaleById,
};
