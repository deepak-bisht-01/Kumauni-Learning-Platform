import supabase from "../config/supabase.js";

// Map frontend levels to database levels
const LEVEL_MAPPING = {
  "beginner": "beginner",
  "easy": "beginner",      // Map to beginner for now
  "medium": "intermediate", // Map to intermediate
  "hard": "intermediate",   // Map to intermediate
  "expert": "advanced"      // Map to advanced
};

const LEVELS = ["beginner", "easy", "medium", "hard", "expert"];

export const getLevels = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get progress for each level (using actual DB levels)
    const { data: progressData } = await supabase
      .from("progress")
      .select(`
        status,
        lessons!inner(level)
      `)
      .eq("user_id", userId)
      .eq("status", "completed");

    // Get total lessons per level
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("level");

    // Count completed lessons per level
    const progressByLevel = {};
    progressData?.forEach(p => {
      const level = p.lessons?.level;
      if (level) {
        progressByLevel[level] = (progressByLevel[level] || 0) + 1;
      }
    });

    // Count total lessons per level
    const totalByLevel = {};
    lessonsData?.forEach(l => {
      totalByLevel[l.level] = (totalByLevel[l.level] || 0) + 1;
    });

    const levels = LEVELS.map((levelId, index) => {
      const dbLevel = LEVEL_MAPPING[levelId];
      const completed = progressByLevel[dbLevel] || 0;
      const total = totalByLevel[dbLevel] || 0;
      const prevLevelCompleted = index === 0 || (progressByLevel[LEVEL_MAPPING[LEVELS[index - 1]]] || 0) > 0;

      return {
        id: levelId,
        name: levelId.charAt(0).toUpperCase() + levelId.slice(1),
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed: prevLevelCompleted,
        lessonsCount: total,
        quizzesCount: 0,
      };
    });

    res.json({ success: true, levels });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLevelContent = async (req, res) => {
  try {
    const { levelId } = req.params;
    const userId = req.user.id;
    const dbLevel = LEVEL_MAPPING[levelId] || levelId; // Map to DB level

    // Get lessons
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*")
      .eq("level", dbLevel)
      .order("id", { ascending: true });

    // Get user progress for lessons
    const { data: progressData } = await supabase
      .from("progress")
      .select("lesson_id, status")
      .eq("user_id", userId);

    const progressMap = {};
    progressData?.forEach(p => {
      progressMap[p.lesson_id] = p.status;
    });

    // Get quizzes (if table exists)
    let quizzes = [];
    try {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("level", dbLevel)
        .order("id", { ascending: true });

      const { data: quizProgress } = await supabase
        .from("quiz_progress")
        .select("quiz_id, status")
        .eq("user_id", userId);

      const quizProgressMap = {};
      quizProgress?.forEach(qp => {
        quizProgressMap[qp.quiz_id] = qp.status;
      });

      quizzes = (quizData || []).map((q) => ({
        id: q.id,
        title: q.title || "Quiz",
        description: q.description || "",
        questionsCount: q.questions_count || 5,
        completed: quizProgressMap[q.id] === "completed",
      }));
    } catch (e) {
      console.log("Quizzes table not found");
    }

    // Get assignments (if table exists)
    let assignments = [];
    try {
      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*")
        .eq("level", dbLevel)
        .order("id", { ascending: true });

      const { data: assignmentProgress } = await supabase
        .from("assignment_progress")
        .select("assignment_id, status")
        .eq("user_id", userId);

      const assignmentProgressMap = {};
      assignmentProgress?.forEach(ap => {
        assignmentProgressMap[ap.assignment_id] = ap.status;
      });

      assignments = (assignmentData || []).map((a) => ({
        id: a.id,
        title: a.title || "Assignment",
        description: a.description || "",
        completed: assignmentProgressMap[a.id] === "completed",
      }));
    } catch (e) {
      console.log("Assignments table not found");
    }

    res.json({
      success: true,
      levelName: levelId.charAt(0).toUpperCase() + levelId.slice(1),
      description: `Learn Kumaoni at ${levelId} level`,
      lessons: (lessonsData || []).map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description || "",
        type: l.content_type || "text",
        duration: l.duration || 5,
        completed: progressMap[l.id] === "completed",
      })),
      quizzes,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching level content:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { levelId, lessonId } = req.params;
    const userId = req.user.id;
    const dbLevel = LEVEL_MAPPING[levelId] || levelId;

    // Get lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("level", dbLevel)
      .single();

    if (lessonError || !lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // Get user progress for this lesson
    const { data: progress } = await supabase
      .from("progress")
      .select("status")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    // Fetch flexible content blocks for the lesson
    let blocks = [];
    try {
      const { data: blockRows } = await supabase
        .from("lesson_blocks")
        .select("id, block_type, title, data, order_index")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });
      blocks = (blockRows || []).map((b) => ({
        id: b.id,
        type: b.block_type,
        title: b.title || null,
        data: b.data || null,
      }));
    } catch (e) {}

    // Get next and previous lessons
    const { data: nextLesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("level", dbLevel)
      .gt("id", lessonId)
      .order("id", { ascending: true })
      .limit(1)
      .single();

    const { data: prevLesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("level", dbLevel)
      .lt("id", lessonId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    // Get level progress
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("level", dbLevel);

    const { data: completedProgress } = await supabase
      .from("progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .in("lesson_id", (allLessons || []).map(l => l.id));

    const totalLessons = allLessons?.length || 0;
    const completedLessons = completedProgress?.length || 0;
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // Determine content type
    let contentType = "text";
    if (lesson.video_url) contentType = "video";
    else if (lesson.audio_url) contentType = "audio";
    else if (lesson.content_type) contentType = lesson.content_type;

    const xpReward = 10;

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || "",
        type: contentType,
        content: lesson.content || "",
        videoUrl: lesson.video_url || null,
        audioUrl: lesson.audio_url || null,
        completed: progress?.status === "completed",
        nextLessonId: nextLesson?.id || null,
        prevLessonId: prevLesson?.id || null,
        xpReward: xpReward,
        blocks,
        levelProgress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: progressPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // Check if already completed
    const { data: existing } = await supabase
      .from("progress")
      .select("status")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    const isNewCompletion = !existing || existing.status !== "completed";
    const xpReward = 10; // XP per lesson

    // Update or insert progress
    if (existing) {
      await supabase
        .from("progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("lesson_id", lessonId);
    } else {
      await supabase
        .from("progress")
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          status: "completed",
          completed_at: new Date().toISOString(),
        });
    }

    // Award XP if newly completed
    if (isNewCompletion) {
      try {
        // Check if leaderboard entry exists
        const { data: existingLeaderboard } = await supabase
          .from("leaderboard")
          .select("xp_total")
          .eq("user_id", userId)
          .single();

        if (existingLeaderboard) {
          await supabase
            .from("leaderboard")
            .update({ xp_total: existingLeaderboard.xp_total + xpReward })
            .eq("user_id", userId);
        } else {
          await supabase
            .from("leaderboard")
            .insert({ user_id: userId, xp_total: xpReward });
        }
      } catch (leaderboardError) {
        console.log("Leaderboard update skipped:", leaderboardError.message);
      }
    }

    res.json({ 
      success: true, 
      message: "Lesson completed",
      xpEarned: isNewCompletion ? xpReward : 0,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLevelModule = async (req, res) => {
  try {
    const { levelId, type } = req.params;
    const userId = req.user.id;
    const dbLevel = LEVEL_MAPPING[levelId] || levelId;

    if (type === "quizzes") {
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, title, description, questions_count")
        .in("level", [dbLevel, levelId])
        .order("id", { ascending: true });
      const { data: qp } = await supabase
        .from("quiz_progress")
        .select("quiz_id, status")
        .eq("user_id", userId);
      const pm = {};
      qp?.forEach((r) => { pm[r.quiz_id] = r.status; });
      const quizItems = (quizzes || []).map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        questions_count: q.questions_count,
        completed: pm[q.id] === "completed",
        source: "quizzes",
      }));

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .in("level", [dbLevel, levelId]);
      const lessonIds = (lessons || []).map((l) => l.id);
      const { data: quizBlocks } = await supabase
        .from("lesson_blocks")
        .select("id, lesson_id, block_type, title, data")
        .in("lesson_id", lessonIds)
        .eq("block_type", "quiz")
        .order("order_index", { ascending: true });
      const { data: lbp } = await supabase
        .from("lesson_block_progress")
        .select("block_id, status")
        .eq("user_id", userId);
      const lbpm = {};
      lbp?.forEach((r) => { lbpm[r.block_id] = r.status; });
      const blockItems = (quizBlocks || []).map((b) => ({
        id: b.id,
        lesson_id: b.lesson_id,
        block_type: b.block_type,
        title: b.title,
        data: b.data,
        completed: lbpm[b.id] === "completed",
        source: "lesson_blocks",
      }));
      return res.json({ success: true, items: [...quizItems, ...blockItems] });
    }

    if (type === "daily_words") {
      const { data } = await supabase
        .from("flashcards")
        .select("id, english_word, kumaoni_word, reviewed_count")
        .eq("user_id", userId)
        .order("reviewed_count", { ascending: true })
        .limit(50);
      return res.json({ success: true, items: data || [] });
    }

    const blockType = type === "word_meanings" ? "word_meaning" : type === "sentence_making" ? "sentence_making" : type;
    const blockTypeAliases = [blockType];
    if (blockType === "sentence_making") {
      blockTypeAliases.push("sentence-making", "sentence");
    }
    if (blockType === "word_meaning") {
      blockTypeAliases.push("word-meaning", "vocabulary", "words");
    }
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .in("level", [dbLevel, levelId]);
    const lessonIds = (lessons || []).map((l) => l.id);
    if (lessonIds.length === 0) return res.json({ success: true, items: [] });

    const { data: blocks } = await supabase
      .from("lesson_blocks")
      .select("id, lesson_id, block_type, title, data")
      .in("lesson_id", lessonIds)
      .in("block_type", blockTypeAliases)
      .order("order_index", { ascending: true });

    const { data: lbp } = await supabase
      .from("lesson_block_progress")
      .select("block_id, status")
      .eq("user_id", userId);
    const pm = {};
    lbp?.forEach((r) => { pm[r.block_id] = r.status; });
    const items = (blocks || []).map((b) => ({
      id: b.id,
      lesson_id: b.lesson_id,
      block_type: b.block_type,
      title: b.title,
      data: b.data,
      completed: pm[b.id] === "completed",
    }));

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const completeBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { score } = req.body || {};
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from("lesson_block_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("block_id", blockId)
      .single();

    if (existing) {
      await supabase
        .from("lesson_block_progress")
        .update({ status: "completed", score: score ?? null, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("block_id", blockId);
    } else {
      await supabase
        .from("lesson_block_progress")
        .insert({ user_id: userId, block_id: blockId, status: "completed", score: score ?? null });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
