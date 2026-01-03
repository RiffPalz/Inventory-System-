import express from "express";
import {
  fetchNotifications,
  fetchUnreadCount,
  readNotification,
  readAllNotifications,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", verifyToken, fetchNotifications);
router.get("/unread-count", verifyToken, fetchUnreadCount);
router.patch("/:id/read", verifyToken, readNotification);
router.patch("/read-all", verifyToken, readAllNotifications);

export default router;
