// frontend/src/services/api.js
import authService from './authService';

export async function fetchDashboardOverview(token) {
  try {
    console.log("Making dashboard API request with token:", token ? "Token present" : "No token");
    const res = await fetch("http://localhost:5000/api/dashboard/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Dashboard API response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Dashboard API response data:", data);
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Failed to fetch dashboard: " + error.message };
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

// Add function to mark story as complete
export async function markStoryComplete(token, storyId) {
  try {
    const res = await fetch(`http://localhost:5000/api/stories/${storyId}/complete`, {
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
    return { success: false, message: "Failed to mark story complete" };
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

// Add new function to complete module items
export async function completeModuleItem(token, itemId, score) {
  try {
    // For now, we'll use the same endpoint as completeBlock since the backend might handle both
    // In a real implementation, you might have a separate endpoint
    const res = await fetch(`http://localhost:5000/api/learning/blocks/${itemId}/complete`, {
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
    return { success: false, message: "Failed to complete module item" };
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