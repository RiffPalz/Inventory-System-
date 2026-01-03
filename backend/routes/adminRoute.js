import express from "express";
import {
  registerAdminController,
  loginAdminController,
  logoutAdminController,
  refreshTokenController,
  getMeController,
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/adminauth.js";
import { upload } from "../middleware/upload.js";
import { updateProfileController } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdminController);
router.post("/login", loginAdminController);
router.post("/refresh", refreshTokenController);

router.post("/logout", verifyToken, logoutAdminController);
router.get("/me", verifyToken, getMeController);


router.put("/profile", verifyToken, upload.single("image"), updateProfileController);

export default router;
