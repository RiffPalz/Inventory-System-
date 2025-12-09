import express from "express";
import {
  loginAdmin,
  loginCode,
  registerAdmin,
} from "../controllers/adminAuthController.js";
import adminAuth from "../middleware/adminauth.js";
import profileController from "../controllers/adminProfileController.js";

const adminRouter = express.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/login/authentication", loginCode);

// Protected profile endpoints using the adminAuth middleware
adminRouter.get("/profile", adminAuth, profileController.getAdminProfile);
adminRouter.put("/profile", adminAuth, profileController.updateAdminProfile);

export default adminRouter;