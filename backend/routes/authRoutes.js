// backend/routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import { register, login, getCurrentUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js"; // ✅ named import

const router = express.Router();

// ✅ Validation rules
const registerValidation = [
  body("full_name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").optional().trim(),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ✅ Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", requireAuth, getCurrentUser); // ✅ use correct name here

export default router;
