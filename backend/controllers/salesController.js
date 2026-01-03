import salesService from "../services/salesService.js";
import { createNotification, createLowStockNotificationIfNeeded } from "../services/notificationService.js";
import { io } from "../server.js";
import productService from "../services/productService.js";

const createSale = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const sale = await salesService.createSale({
      ...req.body,
      adminId,
    });

    // 1. 🔔 RECORD SALE NOTIFICATION
    const saleNotif = await createNotification({
      adminId,
      type: "sale",
      title: "New Sale Recorded",
      message: `A sale for ${sale.productName} (${sale.quantity} item(s)) was recorded.`,
      referenceId: sale.ID,
    });

    // 2. 🚀 EMIT SALE NOTIFICATION LIVE
    io.to(`admin-${adminId}`).emit("new-notification", saleNotif);

    // 3. 📉 CHECK FOR LOW STOCK (After Sale)
    const product = await productService.getProductById(sale.productId);

    if (product) {
      const stockNotif = await createLowStockNotificationIfNeeded({
        adminId,
        product,
      });

      // 4. 🚀 EMIT LOW STOCK ALERT LIVE
      if (stockNotif) {
        io.to(`admin-${adminId}`).emit("new-notification", stockNotif);
      }
    }

    res.status(201).json(sale);
  } catch (error) {
    console.error("Create Sale Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// RE-ADDED MISSING FUNCTIONS TO FIX REFERENCE ERROR
const getAllSales = async (req, res) => {
  try {
    const sales = await salesService.getAllSales();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await salesService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createSale,
  getAllSales, // Now defined above
  getSaleById, // Now defined above
};