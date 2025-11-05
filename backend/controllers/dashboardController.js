// backend/controllers/dashboardController.js
import db from "../config/database.js";

/**
 * GET /api/dashboard/overview
 * Returns everything the dashboard needs in one call
 */
export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user?.id; // set by requireAuth
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // --- Progress summary ---
    const [[completedRow]] = await db.query(
      "SELECT COUNT(*) AS lessons_completed FROM progress WHERE user_id=? AND status='completed'",
      [userId]
    );

    const [[flashRow]] = await db.query(
      "SELECT IFNULL(SUM(reviewed_count),0) AS reviewed FROM flashcards WHERE user_id=?",
      [userId]
    );

    // leaderboard may have column `rank` (quoted) OR `user_rank` – handle both
    const [[xpRow]] = await db.query(
      "SELECT xp_total, IFNULL(`rank`, user_rank) AS user_rank FROM leaderboard WHERE user_id=? LIMIT 1",
      [userId]
    ).catch(() => [[{ xp_total: 0, user_rank: null }]]);

    // last accessed lesson
    const [[lastAccess]] = await db.query(
      `SELECT p.lesson_id, l.title, p.last_accessed
       FROM progress p
       JOIN lessons l ON l.id = p.lesson_id
       WHERE p.user_id=? 
       ORDER BY p.last_accessed DESC
       LIMIT 1`,
      [userId]
    );

    // Achievements (last 6)
    const [achievements] = await db.query(
      `SELECT a.id, a.name, a.xp_reward, ua.timestamp
         FROM user_achievements ua
         JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id=?
       ORDER BY ua.timestamp DESC
       LIMIT 6`,
      [userId]
    );

    // Leaderboard Top 3
    const [top3] = await db.query(
      `SELECT u.user_name, l.xp_total
         FROM leaderboard l
         JOIN users u ON u.id = l.user_id
       ORDER BY l.xp_total DESC
       LIMIT 3`
    );

    // Daily challenge (10 least reviewed words for this user)
    const [dailyCards] = await db.query(
      `SELECT id, english_word, kumaoni_word, reviewed_count
         FROM flashcards
       WHERE user_id=?
       ORDER BY reviewed_count ASC, id ASC
       LIMIT 10`,
      [userId]
    );

    return res.json({
      success: true,
      data: {
        progressSummary: {
          lessonsCompleted: completedRow?.lessons_completed ?? 0,
          flashcardsReviewed: flashRow?.reviewed ?? 0,
          xp: xpRow?.xp_total ?? 0,
        },
        currentLesson: lastAccess
          ? { id: lastAccess.lesson_id, title: lastAccess.title, lastAccessed: lastAccess.last_accessed }
          : null,
        achievements,
        leaderboardTop: top3,
        dailyChallenge: {
          goal: 10,
          words: dailyCards, // array of {id, english_word, kumaoni_word, reviewed_count}
          message: "Learn 10 new Kumauni words today and earn 50 XP!",
          bonusXp: 50,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
