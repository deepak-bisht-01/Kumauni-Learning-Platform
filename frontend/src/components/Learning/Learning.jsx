import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Award, TrendingUp, ArrowRight, Lock } from "lucide-react";
import { fetchLearningLevels } from "../../services/api";

const LEVELS = [
  { id: "beginner", name: "Beginner", color: "#10b981", icon: "🌱" },
  { id: "easy", name: "Easy", color: "#3b82f6", icon: "📚" },
  { id: "medium", name: "Medium", color: "#f59e0b", icon: "🎯" },
  { id: "hard", name: "Hard", color: "#ef4444", icon: "🔥" },
  { id: "expert", name: "Expert", color: "#8b5cf6", icon: "⭐" },
];

export default function Learning() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchLearningLevels(token)
      .then((data) => {
        if (data.success) {
          setLevels(data.levels || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const handleLevelClick = (levelId) => {
    navigate(`/learning/${levelId}`);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading levels...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Start Learning Kumaoni</h1>
          <p style={styles.subtitle}>Choose your level and begin your journey</p>
        </div>

        <div style={styles.levelsGrid}>
          {LEVELS.map((level, index) => {
            const levelData = levels.find((l) => l.id === level.id);
            const isLocked = index > 0 && !levels[index - 1]?.completed;
            const progress = levelData?.progress || 0;

            return (
              <div
                key={level.id}
                style={{
                  ...styles.levelCard,
                  background: `linear-gradient(135deg, ${level.color}22 0%, ${level.color}11 100%)`,
                  border: `2px solid ${isLocked ? "rgba(255,255,255,0.1)" : level.color}40`,
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                }}
                onClick={() => !isLocked && handleLevelClick(level.id)}
              >
                {isLocked && (
                  <div style={styles.lockOverlay}>
                    <Lock size={24} />
                  </div>
                )}
                <div style={styles.levelIcon}>{level.icon}</div>
                <h2 style={styles.levelName}>{level.name}</h2>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${progress}%`,
                      background: level.color,
                    }}
                  />
                </div>
                <div style={styles.progressText}>{progress}% Complete</div>
                <div style={styles.levelStats}>
                  <span>{levelData?.lessonsCount || 0} Lessons</span>
                  <span>•</span>
                  <span>{levelData?.quizzesCount || 0} Quizzes</span>
                </div>
                <button
                  style={{
                    ...styles.levelButton,
                    background: isLocked ? "#666" : level.color,
                  }}
                  disabled={isLocked}
                >
                  {isLocked ? "Locked" : "Start"} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0a0f1c 40%, #151129 100%)",
    color: "#e6edf6",
    fontFamily: "Inter, sans-serif",
    padding: "80px 20px 40px",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 10,
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  levelsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  levelCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    textAlign: "center",
    position: "relative",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  lockOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    opacity: 0.5,
  },
  levelIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  levelName: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s",
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
  },
  levelStats: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },
  levelButton: {
    width: "100%",
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.2s",
  },
  loading: {
    textAlign: "center",
    fontSize: 18,
    color: "#7f5af0",
    padding: "40px 20px",
  },
};
