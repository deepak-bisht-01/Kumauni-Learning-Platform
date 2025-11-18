// backend/routes/dashboardRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getOverview } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/overview", requireAuth, getOverview);

export default router;
