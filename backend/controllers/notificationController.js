import {
  getNotificationsByAdmin,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
} from "../services/notificationService.js";

/**
 * GET /api/notifications
 */
export const fetchNotifications = async (req, res) => {
  try {
    const adminId = req.admin.id; // 🔥 FIXED
    const notifications = await getNotificationsByAdmin(adminId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const fetchUnreadCount = async (req, res) => {
  try {
    const adminId = req.admin.id; // 🔥 FIXED
    const count = await getUnreadCount(adminId);
    res.json({ unread: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const readNotification = async (req, res) => {
  try {
    const adminId = req.admin.id; // 🔥 FIXED
    const { id } = req.params;

    await markNotificationAsRead(id, adminId);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const readAllNotifications = async (req, res) => {
  try {
    const adminId = req.admin.id; // 🔥 FIXED
    await markAllAsRead(adminId);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};
