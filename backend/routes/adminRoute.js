import express from "express";


import {
  registerAdmin,
  loginAdmin,
  loginCode,
} from "../controllers/adminAuthController.js";


const adminRouter = express.Router();


adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/login/authentication", loginCode);





export default adminRouter;
