import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Volume2, FileText, CheckCircle, Star, TrendingUp } from "lucide-react";
import { fetchLesson, markLessonComplete } from "../../services/api";

// Add a custom event for dashboard refresh
// Using a more robust approach for creating custom events
const refreshDashboardEvent = new CustomEvent('refreshDashboard');

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
        
        // Dispatch event to refresh dashboard
        console.log('Dispatching refreshDashboard event from LessonView');
        window.dispatchEvent(refreshDashboardEvent);
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

        {/* Submodules Section - Now links to separate pages */}
        {Array.isArray(lesson.blocks) && lesson.blocks.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Learning Modules</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {lesson.blocks.map((block) => (
                <div 
                  key={block.id} 
                  style={styles.blockCard}
                  onClick={() => navigate(`/learning/${levelId}/${lessonId}/submodule/${block.id}`)}
                >
                  <div style={styles.itemHeader}>
                    <span style={styles.itemNumber}>
                      {block.title || 
                       (block.type === "text" ? "Text Content" : 
                        block.type === "word_meaning" ? "Word Meanings" : 
                        block.type === "sentence_making" ? "Sentence Making" : 
                        block.type === "quiz" ? "Quiz" : 
                        "Module")}
                    </span>
                  </div>
                  <div style={styles.blockType}>
                    {block.type === "text" && "📝 Text Content"}
                    {block.type === "word_meaning" && "📚 Vocabulary Builder"}
                    {block.type === "sentence_making" && "✍️ Sentence Construction"}
                    {block.type === "quiz" && "❓ Knowledge Check"}
                    {!["text", "word_meaning", "sentence_making", "quiz"].includes(block.type) && "📄 Learning Module"}
                  </div>
                  <div style={styles.blockDescription}>
                    {block.type === "text" && "Read and understand key concepts"}
                    {block.type === "word_meaning" && "Learn vocabulary one word at a time"}
                    {block.type === "sentence_making" && "Practice constructing sentences in Kumauni"}
                    {block.type === "quiz" && "Test your knowledge with questions"}
                    {!["text", "word_meaning", "sentence_making", "quiz"].includes(block.type) && "Complete this learning module"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
  },
  xpText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#facc15",
  },
  progressSection: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
    fontWeight: 600,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  header: {
    marginBottom: 30,
  },
  lessonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    margin: "0 0 16px 0",
    lineHeight: 1.5,
  },
  xpRewardBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(250,204,21,0.2)",
    border: "1px solid rgba(250,204,21,0.3)",
    borderRadius: 12,
    padding: "8px 16px",
    fontSize: 14,
    color: "#facc15",
  },
  blockCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: "#3b82f6",
  },
  blockType: {
    fontSize: 14,
    opacity: 0.7,
  },
  blockDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 30,
  },
  mediaContainer: {
    width: "100%",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    borderRadius: 12,
    background: "#000",
  },
  videoPlaceholder: {
    width: "100%",
    height: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    color: "#fff",
  },
  audioContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 30,
  },
  audio: {
    width: "100%",
    maxWidth: 400,
  },
  textContent: {
    lineHeight: 1.6,
  },
  textContentInner: {
    lineHeight: 1.6,
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#e6edf6",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
  },
  nextButton: {
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
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
