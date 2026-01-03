import Notification from "../models/notification.js";

/**
 * CREATE GENERIC NOTIFICATION
 */
export const createNotification = async ({
  adminId,
  type,
  title,
  message,
  referenceId = null,
}) => {
  return await Notification.create({
    adminId,
    type,
    title,
    message,
    referenceId,
  });
};

/**
 * GET ALL NOTIFICATIONS FOR ADMIN
 */
export const getNotificationsByAdmin = async (adminId) => {
  return await Notification.findAll({
    where: { adminId },
    order: [["createdAt", "DESC"]],
  });
};

/**
 * GET UNREAD COUNT
 */
export const getUnreadCount = async (adminId) => {
  return await Notification.count({
    where: {
      adminId,
      isRead: false,
    },
  });
};

/**
 * MARK ONE NOTIFICATION AS READ
 */
export const markNotificationAsRead = async (id, adminId) => {
  return await Notification.update(
    { isRead: true },
    {
      where: {
        ID: id,
        adminId,
      },
    }
  );
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
export const markAllAsRead = async (adminId) => {
  return await Notification.update(
    { isRead: true },
    {
      where: {
        adminId,
        isRead: false,
      },
    }
  );
};

/**
 * LOW / OUT-OF-STOCK NOTIFICATION (THRESHOLD = 10)
 */
export const createLowStockNotificationIfNeeded = async ({
  adminId,
  product,
}) => {
  const LOW_STOCK_THRESHOLD = 10;

  if (product.inStock > LOW_STOCK_THRESHOLD) return;

  const isOutOfStock = product.inStock === 0;

  const title = isOutOfStock
    ? "Out of Stock Alert"
    : "Low Stock Alert";

  const message = isOutOfStock
    ? `${product.name} is out of stock.`
    : `${product.name} stock is low (${product.inStock} left).`;

  return await Notification.create({
    adminId,
    type: "stock",
    title,
    message,
    referenceId: product.ID,
  });
};
