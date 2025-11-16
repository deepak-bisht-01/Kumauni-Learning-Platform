import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Volume2, FileText, CheckCircle, Star, TrendingUp } from "lucide-react";
import { fetchLesson, markLessonComplete } from "../../services/api";

export default function LessonView() {
  const { levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchLesson(token, levelId, lessonId)
      .then((data) => {
        if (data.success) {
          setLesson(data.lesson);
          setCompleted(data.lesson.completed || false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [levelId, lessonId, navigate]);

  const handleNext = async () => {
    const token = localStorage.getItem("token");
    if (lesson && !completed) {
      const result = await markLessonComplete(token, lessonId);
      if (result.success && result.xpEarned > 0) {
        setXpEarned(result.xpEarned);
        setShowXpAnimation(true);
        setTimeout(() => setShowXpAnimation(false), 3000);
      }
      setCompleted(true);
    }

    // Navigate to next lesson or back to level
    if (lesson?.nextLessonId) {
      navigate(`/learning/${levelId}/${lesson.nextLessonId}`);
    } else {
      navigate(`/learning/${levelId}`);
    }
  };

  const handlePrevious = () => {
    if (lesson?.prevLessonId) {
      navigate(`/learning/${levelId}/${lesson.prevLessonId}`);
    } else {
      navigate(`/learning/${levelId}`);
    }
  };

  const handleBack = () => {
    navigate(`/learning/${levelId}`);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Lesson not found</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={18} /> Back to Level
        </button>

        {/* XP Earned Animation */}
        {showXpAnimation && (
          <div style={styles.xpAnimation}>
            <Star size={24} color="#facc15" fill="#facc15" />
            <span style={styles.xpText}>+{xpEarned} XP</span>
          </div>
        )}

        {/* Level Progress Bar */}
        {lesson.levelProgress && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>
                {levelId.charAt(0).toUpperCase() + levelId.slice(1)} Level Progress
              </span>
              <span style={styles.progressPercentage}>
                {lesson.levelProgress.completed} / {lesson.levelProgress.total} lessons
              </span>
            </div>
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: `${lesson.levelProgress.percentage}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.lessonHeader}>
            <h1 style={styles.title}>{lesson.title}</h1>
            {completed && <CheckCircle size={24} color="#10b981" />}
          </div>
          {lesson.description && (
            <p style={styles.subtitle}>{lesson.description}</p>
          )}
          {!completed && lesson.xpReward && (
            <div style={styles.xpRewardBadge}>
              <Star size={16} color="#facc15" fill="#facc15" />
              <span>Complete to earn {lesson.xpReward} XP</span>
            </div>
          )}
        </div>

        {/* Content based on type */}
        <div style={styles.content}>
          {lesson.type === "video" && (
            <div style={styles.mediaContainer}>
              {lesson.videoUrl ? (
                <video controls style={styles.video}>
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div style={styles.videoPlaceholder}>
                  <Play size={48} color="#fff" />
                  <p style={{ marginTop: 16, opacity: 0.7 }}>
                    {lesson.content || "Video content will be available soon"}
                  </p>
                </div>
              )}
            </div>
          )}

          {lesson.type === "audio" && (
            <div style={styles.mediaContainer}>
              {lesson.audioUrl ? (
                <div style={styles.audioContainer}>
                  <Volume2 size={48} color="#fff" style={{ marginBottom: 20 }} />
                  <audio controls style={styles.audio}>
                    <source src={lesson.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <div style={styles.audioContainer}>
                  <Volume2 size={48} color="#fff" />
                  <p style={{ marginTop: 16, opacity: 0.7 }}>
                    {lesson.content || "Audio content will be available soon"}
                  </p>
                </div>
              )}
            </div>
          )}

          {lesson.type === "text" && (
            <div style={styles.textContent}>
              <FileText size={24} style={{ marginBottom: 16, opacity: 0.7 }} />
              <div 
                style={styles.textContentInner}
                dangerouslySetInnerHTML={{ __html: lesson.content || "No content available" }} 
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button 
            style={{
              ...styles.navButton,
              opacity: lesson.prevLessonId ? 1 : 0.5,
              cursor: lesson.prevLessonId ? "pointer" : "not-allowed",
            }}
            onClick={handlePrevious}
            disabled={!lesson.prevLessonId}
          >
            <ArrowLeft size={18} /> Previous
          </button>
          <button style={styles.nextButton} onClick={handleNext}>
            {lesson.nextLessonId ? "Next Lesson" : "Complete Level"} <ArrowRight size={18} />
          </button>
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
    maxWidth: 900,
    margin: "0 auto",
    position: "relative",
  },
  backButton: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 20px",
    color: "#e6edf6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    fontSize: 14,
    transition: "all 0.2s",
  },
  xpAnimation: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0,0,0,0.9)",
    borderRadius: 16,
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    zIndex: 1000,
    animation: "fadeInOut 3s ease-in-out",
    boxShadow: "0 8px 32px rgba(250, 204, 21, 0.4)",
    border: "2px solid #facc15",
  },
  xpText: {
    fontSize: 24,
    fontWeight: 700,
    color: "#facc15",
  },
  progressSection: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 600,
    opacity: 0.8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 700,
    color: "#22d3ee",
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    borderRadius: 5,
    transition: "width 0.5s ease",
    boxShadow: "0 0 10px rgba(34,211,238,0.5)",
  },
  header: {
    marginBottom: 30,
  },
  lessonHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  xpRewardBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(250, 204, 21, 0.15)",
    border: "1px solid rgba(250, 204, 21, 0.3)",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#facc15",
  },
  content: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 40,
    marginBottom: 40,
    border: "1px solid rgba(255,255,255,0.08)",
    minHeight: 300,
  },
  mediaContainer: {
    textAlign: "center",
  },
  videoPlaceholder: {
    background: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: "60px 20px",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    maxWidth: 800,
    borderRadius: 12,
    margin: "0 auto",
    display: "block",
  },
  audioContainer: {
    background: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: "40px 20px",
    marginBottom: 20,
    textAlign: "center",
  },
  audio: {
    width: "100%",
    maxWidth: 500,
    margin: "20px auto 0",
    display: "block",
  },
  textContent: {
    lineHeight: 1.8,
  },
  textContentInner: {
    fontSize: 16,
    lineHeight: 1.8,
    "& p": {
      marginBottom: 16,
    },
    "& h2": {
      fontSize: 24,
      fontWeight: 700,
      marginTop: 24,
      marginBottom: 12,
    },
    "& h3": {
      fontSize: 20,
      fontWeight: 600,
      marginTop: 20,
      marginBottom: 10,
    },
    "& ul, & ol": {
      marginLeft: 20,
      marginBottom: 16,
    },
    "& li": {
      marginBottom: 8,
    },
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
  },
  navButton: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "14px 28px",
    color: "#e6edf6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  nextButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    border: "none",
    borderRadius: 12,
    padding: "14px 28px",
    color: "#081018",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(34,211,238,0.3)",
    marginLeft: "auto",
    transition: "all 0.2s",
  },
  loading: {
    textAlign: "center",
    fontSize: 18,
    color: "#7f5af0",
    padding: "40px 20px",
  },
  error: {
    textAlign: "center",
    fontSize: 18,
    color: "#f87171",
    padding: "40px 20px",
  },
};

// Add CSS animation for XP popup
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
    80% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
  }
`;
document.head.appendChild(styleSheet);
