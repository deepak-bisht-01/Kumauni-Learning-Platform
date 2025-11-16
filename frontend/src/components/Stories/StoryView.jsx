import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Volume2,
  Clock,
  BookOpen,
  Star,
  CheckCircle,
} from "lucide-react";
import { fetchStory, updateStoryProgress, toggleStoryFavorite } from "../../services/api";

export default function StoryView() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchStory(token, storyId)
      .then((data) => {
        if (data.success) {
          setStory(data.story);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storyId, navigate]);

  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    const result = await toggleStoryFavorite(token, storyId);
    if (result.success) {
      setStory((prev) => ({ ...prev, isFavorite: result.isFavorite }));
    }
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("token");
    const result = await updateStoryProgress(token, storyId, {
      progressPercentage: 100,
      status: "completed",
    });

    if (result.success) {
      setStory((prev) => ({
        ...prev,
        readingStatus: "completed",
        progressPercentage: 100,
      }));
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 3000);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading story...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Story not found</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/stories")}>
          <ArrowLeft size={18} /> Back to Stories
        </button>

        {/* XP Animation */}
        {showXpAnimation && (
          <div style={styles.xpAnimation}>
            <Star size={24} color="#facc15" fill="#facc15" />
            <span style={styles.xpText}>+{story.xpReward} XP</span>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <img src={story.image} alt={story.title} style={styles.headerImage} />
          <div style={styles.headerContent}>
            <div style={styles.headerTop}>
              <span style={styles.levelBadge}>{story.level}</span>
              <button style={styles.favoriteButton} onClick={handleFavorite}>
                <Heart
                  size={24}
                  color={story.isFavorite ? "#ef4444" : "#fff"}
                  fill={story.isFavorite ? "#ef4444" : "none"}
                />
              </button>
            </div>
            <h1 style={styles.title}>{story.title}</h1>
            <p style={styles.subtitle}>{story.subtitle}</p>
            <p style={styles.description}>{story.description}</p>

            <div style={styles.meta}>
              <span style={styles.metaItem}>
                <Clock size={16} /> {story.estimatedTime} min read
              </span>
              <span style={styles.metaItem}>
                <BookOpen size={16} /> {story.wordCount} words
              </span>
              {story.audioUrl && (
                <span style={styles.metaItem}>
                  <Volume2 size={16} /> Audio available
                </span>
              )}
            </div>

            {story.progressPercentage > 0 && (
              <div style={styles.progressSection}>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${story.progressPercentage}%`,
                    }}
                  />
                </div>
                <div style={styles.progressText}>
                  {story.progressPercentage}% Complete
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {story.audioUrl && (
            <div style={styles.audioSection}>
              <audio controls style={styles.audio}>
                <source src={story.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          <div
            style={styles.storyContent}
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {story.readingStatus === "completed" ? (
            <div style={styles.completedBadge}>
              <CheckCircle size={20} /> Story Completed! +{story.xpReward} XP earned
            </div>
          ) : (
            <button style={styles.completeButton} onClick={handleComplete}>
              Mark as Complete
            </button>
          )}
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
    marginBottom: 30,
    fontSize: 14,
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
  header: {
    marginBottom: 40,
  },
  headerImage: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    borderRadius: 20,
    marginBottom: 24,
  },
  headerContent: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelBadge: {
    background: "#3b82f6",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
  },
  favoriteButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    opacity: 0.7,
    fontStyle: "italic",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  meta: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    marginBottom: 20,
    fontSize: 14,
    opacity: 0.7,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  progressSection: {
    marginTop: 20,
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
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 40,
    marginBottom: 40,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  audioSection: {
    marginBottom: 30,
    padding: 20,
    background: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
  audio: {
    width: "100%",
  },
  storyContent: {
    fontSize: 18,
    lineHeight: 1.8,
    "& p": {
      marginBottom: 20,
    },
    "& h2": {
      fontSize: 28,
      fontWeight: 700,
      marginTop: 32,
      marginBottom: 16,
    },
  },
  actions: {
    textAlign: "center",
  },
  completeButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    border: "none",
    borderRadius: 12,
    padding: "14px 32px",
    color: "#081018",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(34,211,238,0.3)",
  },
  completedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#10b981",
    fontSize: 16,
    fontWeight: 600,
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
