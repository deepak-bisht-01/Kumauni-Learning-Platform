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
    
    console.log(`[Dashboard] Fetching overview for user: ${userId}`);
    let completedRow, flashRow, xpRow, lastAccess, achievements, top3, dailyCards;
    let modulesCompleted = 0;

    if (dbType === "supabase") {
      const { data: completedData, error: completedError } = await client
        .from("progress")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");
      if (completedError) {
        console.error("[Dashboard] Error fetching completed lessons:", completedError);
        throw new Error(`Failed to fetch completed lessons: ${completedError.message}`);
      }
      completedRow = { lessons_completed: (completedData || []).length };

      // Get stories read count instead of flashcards
      const { data: storiesData, error: storiesError } = await client
        .from("story_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");
      if (storiesError) {
        console.error("[Dashboard] Error fetching stories:", storiesError);
        throw new Error(`Failed to fetch stories: ${storiesError.message}`);
      }
      flashRow = { reviewed: (storiesData || []).length };

      // Get completed modules count
      const { data: modulesData, error: modulesError } = await client
        .from("lesson_block_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");
      if (modulesError) {
        console.error("[Dashboard] Error fetching modules:", modulesError);
        throw new Error(`Failed to fetch modules: ${modulesError.message}`);
      }
      modulesCompleted = (modulesData || []).length;

      const { data: xpData, error: xpError } = await client
        .from("leaderboard")
        .select("xp_total")
        .eq("user_id", userId)
        .single();
      if (xpError && xpError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
        console.error("[Dashboard] Error fetching XP:", xpError);
        throw new Error(`Failed to fetch XP: ${xpError.message}`);
      }
      xpRow = { xp_total: xpData?.xp_total || 0 };

      const { data: lastProg, error: lastProgError } = await client
        .from("progress")
        .select("lesson_id, last_accessed")
        .eq("user_id", userId)
        .order("last_accessed", { ascending: false })
        .limit(1);
      if (lastProgError) {
        console.error("[Dashboard] Error fetching last progress:", lastProgError);
        throw new Error(`Failed to fetch last progress: ${lastProgError.message}`);
      }
      if (lastProg && lastProg[0]) {
        const lid = lastProg[0].lesson_id;
        const { data: lesson, error: lessonError } = await client
          .from("lessons")
          .select("id, title")
          .eq("id", lid)
          .single();
        if (lessonError) {
          console.error("[Dashboard] Error fetching lesson:", lessonError);
          lastAccess = null;
        } else {
          lastAccess = lesson ? { lesson_id: lesson.id, title: lesson.title, last_accessed: lastProg[0].last_accessed } : null;
        }
      }

      const { data: ach, error: achError } = await client
        .from("user_achievements")
        .select("achievement_id, timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(6);
      if (achError) {
        console.error("[Dashboard] Error fetching achievements:", achError);
        achievements = [];
      } else {
        const ids = (ach || []).map(a => a.achievement_id);
        if (ids.length) {
          const { data: defs, error: defsError } = await client
            .from("achievements")
            .select("id, name, xp_reward")
            .in("id", ids);
          if (defsError) {
            console.error("[Dashboard] Error fetching achievement definitions:", defsError);
            achievements = [];
          } else {
            const map = new Map((defs || []).map(d => [d.id, d]));
            achievements = (ach || []).map(a => ({
              id: a.achievement_id,
              name: map.get(a.achievement_id)?.name || "",
              xp_reward: map.get(a.achievement_id)?.xp_reward || 0,
              timestamp: a.timestamp,
            }));
          }
        } else {
          achievements = [];
        }
      }

      const { data: lb, error: lbError } = await client
        .from("leaderboard")
        .select("user_id, xp_total")
        .order("xp_total", { ascending: false })
        .limit(3);
      if (lbError) {
        console.error("[Dashboard] Error fetching leaderboard:", lbError);
        top3 = [];
      } else {
        top3 = (lb || []).map((r, i) => ({ user_name: `Top ${i + 1}`, xp_total: r.xp_total }));
      }

      // Try to fetch flashcards, but handle if table doesn't exist
      let dailyCards = [];
      try {
        const { data: cards, error: cardsError } = await client
          .from("flashcards")
          .select("id, english_word, kumaoni_word, reviewed_count")
          .eq("user_id", userId)
          .order("reviewed_count", { ascending: true })
          .order("id", { ascending: true })
          .limit(10);
        
        if (cardsError) {
          // If table doesn't exist or other error, just use empty array
          console.warn("[Dashboard] Could not fetch flashcards (table may not exist):", cardsError.message);
          dailyCards = [];
        } else {
          dailyCards = cards || [];
        }
      } catch (err) {
        console.warn("[Dashboard] Error fetching flashcards:", err.message);
        dailyCards = [];
      }
    } else {
      try {
        const [[completedRowMysql]] = await client.query(
          "SELECT COUNT(*) AS lessons_completed FROM progress WHERE user_id=? AND status='completed'",
          [userId]
        );
        completedRow = completedRowMysql;
      } catch (err) {
        console.error("[Dashboard] Error fetching completed lessons (MySQL):", err);
        completedRow = { lessons_completed: 0 };
      }

      // Get stories read count instead of flashcards for MySQL
      try {
        const [[storiesRowMysql]] = await client.query(
          "SELECT COUNT(*) AS reviewed FROM story_progress WHERE user_id=? AND status='completed'",
          [userId]
        );
        flashRow = storiesRowMysql;
      } catch (err) {
        console.error("[Dashboard] Error fetching stories (MySQL):", err);
        flashRow = { reviewed: 0 };
      }

      // Get completed modules count for MySQL
      try {
        const [modulesRowsMysql] = await client.query(
          "SELECT COUNT(*) AS modules_completed FROM lesson_block_progress WHERE user_id=? AND status='completed'",
          [userId]
        );
        modulesCompleted = modulesRowsMysql?.[0]?.modules_completed || 0;
      } catch (err) {
        console.error("[Dashboard] Error fetching modules (MySQL):", err);
        modulesCompleted = 0;
      }

      try {
        const [[xpRowMysql]] = await client.query(
          "SELECT xp_total FROM leaderboard WHERE user_id=? LIMIT 1",
          [userId]
        );
        xpRow = xpRowMysql || { xp_total: 0 };
      } catch (err) {
        console.error("[Dashboard] Error fetching XP (MySQL):", err);
        xpRow = { xp_total: 0 };
      }

      try {
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
      } catch (err) {
        console.error("[Dashboard] Error fetching last access (MySQL):", err);
        lastAccess = null;
      }

      try {
        const [achievementsRows] = await client.query(
          `SELECT a.id, a.name, a.xp_reward, ua.timestamp
           FROM user_achievements ua
           JOIN achievements a ON a.id = ua.achievement_id
           WHERE ua.user_id=?
           ORDER BY ua.timestamp DESC
           LIMIT 6`,
          [userId]
        );
        achievements = achievementsRows || [];
      } catch (err) {
        console.error("[Dashboard] Error fetching achievements (MySQL):", err);
        achievements = [];
      }

      try {
        const [top3Rows] = await client.query(
          `SELECT u.user_name, l.xp_total
           FROM leaderboard l
           JOIN users u ON u.id = l.user_id
           ORDER BY l.xp_total DESC
           LIMIT 3`
        );
        top3 = top3Rows || [];
      } catch (err) {
        console.error("[Dashboard] Error fetching leaderboard (MySQL):", err);
        top3 = [];
      }

      const [dailyCardsRows] = await client.query(
        `SELECT id, english_word, kumaoni_word, reviewed_count
         FROM flashcards
         WHERE user_id=?
         ORDER BY reviewed_count ASC, id ASC
         LIMIT 10`,
        [userId]
      ).catch((err) => {
        console.error("[Dashboard] Error fetching daily cards:", err);
        return [[]];
      });
      dailyCards = dailyCardsRows || [];
    }

    return res.json({
      success: true,
      data: {
        progressSummary: {
          lessonsCompleted: completedRow?.lessons_completed ?? 0,
          flashcardsReviewed: flashRow?.reviewed ?? 0,
          modulesCompleted: modulesCompleted ?? 0,
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
    console.error("[Dashboard] Error in getOverview:", err);
    console.error("[Dashboard] Error stack:", err.stack);
    next(err);
  }
};
