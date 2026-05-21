import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  updateProfile,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.post("/google",          googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp",      verifyOtp);
router.post("/reset-password",  resetPassword);

// Protected routes
router.get("/me",                protect, getMe);
router.put("/update-profile",    protect, updateProfile);  // ← THE KEY ROUTE

export default router;