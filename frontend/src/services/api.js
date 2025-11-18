// frontend/src/services/api.js
export async function fetchDashboardOverview(token) {
  try {
    const res = await fetch("http://localhost:5000/api/dashboard/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch dashboard" };
  }
}

export async function fetchStories(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.level) params.append("level", filters.level);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`http://localhost:5000/api/stories?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch stories" };
  }
}

export async function fetchStory(token, storyId) {
  try {
    const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch story" };
  }
}

export async function updateStoryProgress(token, storyId, progress) {
  try {
    const res = await fetch(`http://localhost:5000/api/stories/${storyId}/progress`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progress),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to update progress" };
  }
}

export async function toggleStoryFavorite(token, storyId) {
  try {
    const res = await fetch(`http://localhost:5000/api/stories/${storyId}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to toggle favorite" };
  }
}

export async function fetchLearningLevels(token) {
  try {
    const res = await fetch("http://localhost:5000/api/learning/levels", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return { success: false, message: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch learning levels" };
  }
}

export async function fetchLevelContent(token, levelId) {
  try {
    const res = await fetch(`http://localhost:5000/api/learning/levels/${levelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return { success: false, message: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch level content" };
  }
}

export async function fetchLevelModule(token, levelId, type) {
  try {
    const res = await fetch(`http://localhost:5000/api/learning/levels/${levelId}/module/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return { success: false, message: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Failed to fetch module" };
  }
}

export async function completeBlock(token, blockId, score) {
  try {
    const res = await fetch(`http://localhost:5000/api/learning/blocks/${blockId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Failed to complete block" };
  }
}

export async function fetchLesson(token, levelId, lessonId) {
  try {
    const res = await fetch(`http://localhost:5000/api/learning/levels/${levelId}/lessons/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch lesson" };
  }
}

export async function markLessonComplete(token, lessonId) {
  try {
    const res = await fetch(`http://localhost:5000/api/learning/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to mark lesson complete" };
  }
}

export async function fetchDailyQuiz(token) {
  try {
    const res = await fetch("http://localhost:5000/api/quiz/daily", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch daily quiz" };
  }
}

export async function submitDailyQuiz(token, quizData) {
  try {
    const res = await fetch("http://localhost:5000/api/quiz/daily/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to submit quiz" };
  }
}