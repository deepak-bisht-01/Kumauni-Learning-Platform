// backend/routes/dashboardRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getOverview } from "../controllers/dashboardController.js";

const router = express.Router();

console.log("Dashboard routes initialized");

router.get("/overview", requireAuth, (req, res, next) => {
  console.log("Dashboard overview route called");
  console.log("User from token:", req.user);
  next();
}, getOverview);

export default router;
