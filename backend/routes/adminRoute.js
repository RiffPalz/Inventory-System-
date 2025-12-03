import express from "express";
import {
  loginAdmin,
  loginCode,
  registerAdmin,
  getAdminProfile,
} from "../controllers/adminAuthController.js";
import adminAuth from "../middleware/adminauth.js";

const adminRouter = express.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/login/authentication", loginCode);

// Protected route — admin only
adminRouter.get("/profile", adminAuth, getAdminProfile);

export default adminRouter;
