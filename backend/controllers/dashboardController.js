// backend/controllers/dashboardController.js
import client, { dbType } from "../config/dbClient.js";

/**
 * GET /api/dashboard/overview
 * Returns everything the dashboard needs in one call
 */
export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user?.id; // set by requireAuth
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    let completedRow, flashRow, xpRow, lastAccess, achievements, top3, dailyCards;

    if (dbType === "supabase") {
      const { data: completedData } = await client
        .from("progress")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");
      completedRow = { lessons_completed: (completedData || []).length };

      const { data: flashData } = await client
        .from("flashcards")
        .select("reviewed_count")
        .eq("user_id", userId);
      flashRow = { reviewed: (flashData || []).reduce((s, r) => s + (r.reviewed_count || 0), 0) };

      const { data: xpData } = await client
        .from("leaderboard")
        .select("xp_total, user_rank")
        .eq("user_id", userId)
        .single();
      xpRow = { xp_total: xpData?.xp_total || 0, user_rank: xpData?.user_rank ?? null };

      const { data: lastProg } = await client
        .from("progress")
        .select("lesson_id, last_accessed")
        .eq("user_id", userId)
        .order("last_accessed", { ascending: false })
        .limit(1);
      if (lastProg && lastProg[0]) {
        const lid = lastProg[0].lesson_id;
        const { data: lesson } = await client
          .from("lessons")
          .select("id, title")
          .eq("id", lid)
          .single();
        lastAccess = lesson ? { lesson_id: lesson.id, title: lesson.title, last_accessed: lastProg[0].last_accessed } : null;
      }

      const { data: ach } = await client
        .from("user_achievements")
        .select("achievement_id, timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(6);
      const ids = (ach || []).map(a => a.achievement_id);
      if (ids.length) {
        const { data: defs } = await client
          .from("achievements")
          .select("id, name, xp_reward")
          .in("id", ids);
        const map = new Map((defs || []).map(d => [d.id, d]));
        achievements = (ach || []).map(a => ({
          id: a.achievement_id,
          name: map.get(a.achievement_id)?.name || "",
          xp_reward: map.get(a.achievement_id)?.xp_reward || 0,
          timestamp: a.timestamp,
        }));
      } else {
        achievements = [];
      }

      const { data: lb } = await client
        .from("leaderboard")
        .select("user_id, xp_total")
        .order("xp_total", { ascending: false })
        .limit(3);
      top3 = (lb || []).map((r, i) => ({ user_name: `Top ${i + 1}`, xp_total: r.xp_total }));

      const { data: cards } = await client
        .from("flashcards")
        .select("id, english_word, kumaoni_word, reviewed_count")
        .eq("user_id", userId)
        .order("reviewed_count", { ascending: true })
        .order("id", { ascending: true })
        .limit(10);
      dailyCards = cards || [];
    } else {
      const [[completedRowMysql]] = await client.query(
        "SELECT COUNT(*) AS lessons_completed FROM progress WHERE user_id=? AND status='completed'",
        [userId]
      );
      completedRow = completedRowMysql;

      const [[flashRowMysql]] = await client.query(
        "SELECT IFNULL(SUM(reviewed_count),0) AS reviewed FROM flashcards WHERE user_id=?",
        [userId]
      );
      flashRow = flashRowMysql;

      const [[xpRowMysql]] = await client
        .query(
          "SELECT xp_total, IFNULL(`rank`, user_rank) AS user_rank FROM leaderboard WHERE user_id=? LIMIT 1",
          [userId]
        )
        .catch(() => [[{ xp_total: 0, user_rank: null }]]);
      xpRow = xpRowMysql;

      const [[lastAccessMysql]] = await client.query(
        `SELECT p.lesson_id, l.title, p.last_accessed
         FROM progress p
         JOIN lessons l ON l.id = p.lesson_id
         WHERE p.user_id=? 
         ORDER BY p.last_accessed DESC
         LIMIT 1`,
        [userId]
      );
      lastAccess = lastAccessMysql;

      const [achievementsRows] = await client.query(
        `SELECT a.id, a.name, a.xp_reward, ua.timestamp
         FROM user_achievements ua
         JOIN achievements a ON a.id = ua.achievement_id
         WHERE ua.user_id=?
         ORDER BY ua.timestamp DESC
         LIMIT 6`,
        [userId]
      );
      achievements = achievementsRows;

      const [top3Rows] = await client.query(
        `SELECT u.user_name, l.xp_total
         FROM leaderboard l
         JOIN users u ON u.id = l.user_id
         ORDER BY l.xp_total DESC
         LIMIT 3`
      );
      top3 = top3Rows;

      const [dailyCardsRows] = await client.query(
        `SELECT id, english_word, kumaoni_word, reviewed_count
         FROM flashcards
         WHERE user_id=?
         ORDER BY reviewed_count ASC, id ASC
         LIMIT 10`,
        [userId]
      );
      dailyCards = dailyCardsRows;
    }

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
