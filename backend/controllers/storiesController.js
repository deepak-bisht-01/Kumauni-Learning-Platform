import supabase from "../config/supabase.js";

// Get all stories with user progress
export const getStories = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { category, level, search } = req.query;

    // Build base query
    let storiesQuery = supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      storiesQuery = storiesQuery.eq("category", category);
    }
    if (level) {
      storiesQuery = storiesQuery.eq("level", level);
    }
    if (search) {
      storiesQuery = storiesQuery.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: stories, error: storiesError } = await storiesQuery;

    if (storiesError) {
      console.error("Stories query error:", storiesError);
      throw storiesError;
    }

    // Get user-specific progress and favorites separately for better control
    let progressMap = {};
    let favoritesMap = {};
    let readCountMap = {};
    
    if (userId) {
      const { data: progress } = await supabase
        .from("story_progress")
        .select("story_id, status, progress_percentage")
        .eq("user_id", userId);
      
      const { data: favorites } = await supabase
        .from("story_favorites")
        .select("story_id, is_favorite")
        .eq("user_id", userId);

      // Get read counts for all stories
      const { data: allProgressData } = await supabase
        .from("story_progress")
        .select("story_id")
        .eq("status", "completed");

      allProgressData?.forEach(p => {
        readCountMap[p.story_id] = (readCountMap[p.story_id] || 0) + 1;
      });

      progress?.forEach(p => {
        progressMap[p.story_id] = p;
      });
      favorites?.forEach(f => {
        favoritesMap[f.story_id] = f;
      });
    }

    // Get famous stories (manually marked as famous)
    // Try to fetch famous stories, but handle case where column doesn't exist yet
    let famousStoriesData = [];
    try {
      console.log("🔍 Querying famous stories from database...");
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, subtitle, image_url, created_at")
        .eq("is_famous", true)
        .order("created_at", { ascending: false })
        .limit(5);
      
      console.log("🔍 Query result - data:", data);
      console.log("🔍 Query result - error:", error);
      
      if (error) {
        // If column doesn't exist, log warning but continue
        if (error.message?.includes("column") || error.code === "42703") {
          console.log("⚠️ is_famous column not found. Run add-famous-stories-column.sql in Supabase.");
        } else {
          console.error("❌ Error fetching famous stories:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Error details:", JSON.stringify(error, null, 2));
        }
        famousStoriesData = [];
      } else {
        famousStoriesData = data || [];
        console.log("✅ Famous stories query successful. Found:", famousStoriesData.length);
        if (famousStoriesData.length > 0) {
          console.log("First famous story:", JSON.stringify(famousStoriesData[0], null, 2));
        }
      }
    } catch (err) {
      console.error("Error fetching famous stories:", err);
      famousStoriesData = [];
    }

    // Get read counts for famous stories
    const famousStoryIds = (famousStoriesData || []).map(s => s.id);
    
    if (famousStoryIds.length > 0) {
      const { data: progressData } = await supabase
        .from("story_progress")
        .select("story_id")
        .eq("status", "completed")
        .in("story_id", famousStoryIds);

      progressData?.forEach(p => {
        readCountMap[p.story_id] = (readCountMap[p.story_id] || 0) + 1;
      });
    }

    const famousStories = (famousStoriesData || []).map(story => ({
      ...story,
      readCount: readCountMap[story.id] || 0,
    }));

    // Debug: Log famous stories
    console.log("📚 Famous stories found:", famousStories.length);
    if (famousStories.length > 0) {
      console.log("Famous stories data:", JSON.stringify(famousStories, null, 2));
    } else {
      console.log("⚠️  No famous stories found in database!");
      console.log("   Check if stories have is_famous = true in Supabase");
    }

    const popularStoriesResponse = famousStories.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle || "",
      image: p.image_url || "",
      readCount: p.readCount || 0,
    }));

    console.log("📤 Sending popular stories in response:", popularStoriesResponse.length);
    if (popularStoriesResponse.length > 0) {
      console.log("Popular stories response:", JSON.stringify(popularStoriesResponse, null, 2));
    }

    res.json({
      success: true,
      stories: stories.map((s) => {
        const progress = progressMap[s.id];
        const favorite = favoritesMap[s.id];
        return {
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          category: s.category,
          level: s.level,
          image: s.image_url,
          audioUrl: s.audio_url,
          estimatedTime: s.estimated_time,
          wordCount: s.word_count,
          readingStatus: progress?.status || "not_started",
          progressPercentage: progress?.progress_percentage || 0,
          isFavorite: favorite?.is_favorite || false,
          createdAt: s.created_at,
          readCount: readCountMap[s.id] || 0,
        };
      }),
      popular: popularStoriesResponse,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single story with full content
export const getStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user?.id;

    // Get story
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .single();

    if (storyError || !story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Get user progress and favorite
    let progress = null;
    let favorite = null;
    let readCount = 0;
    
    if (userId) {
      const { data: progressData } = await supabase
        .from("story_progress")
        .select("status, progress_percentage")
        .eq("user_id", userId)
        .eq("story_id", storyId)
        .single();
      
      const { data: favoriteData } = await supabase
        .from("story_favorites")
        .select("is_favorite")
        .eq("user_id", userId)
        .eq("story_id", storyId)
        .single();

      progress = progressData;
      favorite = favoriteData;
    }

    // Get read count for this story
    const { data: progressData } = await supabase
      .from("story_progress")
      .select("story_id")
      .eq("status", "completed")
      .eq("story_id", storyId);

    readCount = progressData?.length || 0;

    // Get related stories
    const { data: related } = await supabase
      .from("stories")
      .select("id, title, subtitle, image_url, level")
      .eq("category", story.category)
      .neq("id", storyId)
      .limit(3);

    res.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        description: story.description,
        content: story.content,
        category: story.category,
        level: story.level,
        image: story.image_url,
        audioUrl: story.audio_url,
        estimatedTime: story.estimated_time,
        wordCount: story.word_count,
        xpReward: story.xp_reward || 15,
        readingStatus: progress?.status || "not_started",
        progressPercentage: progress?.progress_percentage || 0,
        isFavorite: favorite?.is_favorite || false,
        createdAt: story.created_at,
        readCount: readCount,
      },
      related: (related || []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        image: r.image_url,
        level: r.level,
      })),
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update reading progress
export const updateProgress = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { progressPercentage, status } = req.body;
    const userId = req.user.id;

    // Check if progress exists
    const { data: existing } = await supabase
      .from("story_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("story_id", storyId)
      .single();

    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from("story_progress")
        .update({
          progress_percentage: progressPercentage,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("story_id", storyId);

      if (error) throw error;
    } else {
      // Insert new progress
      const { error } = await supabase
        .from("story_progress")
        .insert({
          user_id: userId,
          story_id: storyId,
          progress_percentage: progressPercentage,
          status: status,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    // Award XP if completed
    if (status === "completed") {
      const { data: story } = await supabase
        .from("stories")
        .select("xp_reward")
        .eq("id", storyId)
        .single();

      if (story && story.xp_reward) {
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
              .update({ xp_total: existingLeaderboard.xp_total + story.xp_reward })
              .eq("user_id", userId);
          } else {
            await supabase
              .from("leaderboard")
              .insert({ user_id: userId, xp_total: story.xp_reward });
          }
        } catch (e) {
          console.log("Leaderboard update skipped");
        }
      }
    }

    res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Check if favorite exists
    const { data: existing } = await supabase
      .from("story_favorites")
      .select("is_favorite")
      .eq("user_id", userId)
      .eq("story_id", storyId)
      .single();

    let isFavorite;
    if (existing) {
      // Toggle existing favorite
      isFavorite = !existing.is_favorite;
      const { error } = await supabase
        .from("story_favorites")
        .update({ is_favorite: isFavorite })
        .eq("user_id", userId)
        .eq("story_id", storyId);

      if (error) throw error;
    } else {
      // Create new favorite entry
      isFavorite = true;
      const { error } = await supabase
        .from("story_favorites")
        .insert({
          user_id: userId,
          story_id: storyId,
          is_favorite: true,
        });

      if (error) throw error;
    }

    res.json({
      success: true,
      isFavorite: isFavorite,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark story as complete
export const markComplete = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Update progress to 100% and status to completed
    const { data: existing } = await supabase
      .from("story_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("story_id", storyId)
      .single();

    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from("story_progress")
        .update({
          progress_percentage: 100,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("story_id", storyId);

      if (error) throw error;
    } else {
      // Insert new progress
      const { error } = await supabase
        .from("story_progress")
        .insert({
          user_id: userId,
          story_id: storyId,
          progress_percentage: 100,
          status: "completed",
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    }

    // Award XP for completing the story
    const { data: story } = await supabase
      .from("stories")
      .select("xp_reward")
      .eq("id", storyId)
      .single();

    if (story && story.xp_reward) {
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
            .update({ xp_total: existingLeaderboard.xp_total + story.xp_reward })
            .eq("user_id", userId);
        } else {
          await supabase
            .from("leaderboard")
            .insert({ user_id: userId, xp_total: story.xp_reward });
        }
      } catch (e) {
        console.log("Leaderboard update skipped");
      }
    }

    res.json({ success: true, message: "Story marked as complete" });
  } catch (error) {
    console.error("Error marking story complete:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};