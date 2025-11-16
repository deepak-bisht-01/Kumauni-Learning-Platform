import express from "express";
import {
  getDailyQuiz,
  submitDailyQuiz,
} from "../controllers/quizController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/daily", requireAuth, getDailyQuiz);
router.post("/daily/submit", requireAuth, submitDailyQuiz);

export default router;






