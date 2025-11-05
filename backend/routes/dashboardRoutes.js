// backend/routes/dashboardRoutes.js
import express from "express";
import db from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[progress]] = await db.query(
      "SELECT COUNT(*) AS lessonsCompleted FROM progress WHERE user_id = ? AND status = 'completed'",
      [userId]
    );

    const [[xp]] = await db.query(
      "SELECT COALESCE(SUM(a.xp_reward), 0) AS xp FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: {
        progressSummary: {
          lessonsCompleted: progress.lessonsCompleted || 0,
          flashcardsReviewed: 0,
          xp: xp.xp || 0,
          currentStreak: 2, // optional fake data
        },
        currentLesson: {
          id: 1,
          title: "Kumaoni Basics - Greetings",
          progress: 60,
        },
        achievements: [
          { id: 1, name: "First Step", xp_reward: 20, unlocked: true },
          { id: 2, name: "Daily Learner", xp_reward: 40, unlocked: false },
        ],
        leaderboardTop: [
          { user_name: "Deepak Singh", xp_total: 400 },
          { user_name: "Priya Mehra", xp_total: 320 },
          { user_name: "You", xp_total: xp.xp || 0 },
        ],
        dailyChallenge: {
          message: "Translate 5 Kumaoni words correctly",
          bonusXp: 50,
          completed: 2,
          total: 5,
          words: [
            { id: 1, english_word: "Water", kumaoni_word: "Paani", completed: true },
            { id: 2, english_word: "Sun", kumaoni_word: "Suraj", completed: false },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
