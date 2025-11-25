import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  CheckCircle, 
  Star, 
  Clock, 
  BookOpen, 
  Volume2, 
  Share2, 
  Bookmark,
  BookmarkPlus,
  Eye,
  Calendar,
  User,
  Flag,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Maximize,
  Minimize
} from "lucide-react";
import { fetchStory, updateStoryProgress, toggleStoryFavorite, markStoryComplete } from "../../services/api";

// Add a custom event for dashboard refresh
// Using a more robust approach for creating custom events
const refreshDashboardEvent = new CustomEvent('refreshDashboard');

export default function StoryView() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Kumaoni Learner", text: "This story beautifully captures our culture!", likes: 5, timestamp: "2 hours ago" },
    { id: 2, user: "Mountain Reader", text: "I loved the moral of this tale. Very inspiring!", likes: 3, timestamp: "1 day ago" }
  ]);
  const [likedComments, setLikedComments] = useState(new Set());
  const [audioError, setAudioError] = useState(false);
  const contentRef = useRef(null);
  const audioRef = useRef(null);

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
          if (data.story.audioUrl) {
            console.log("Story audio URL:", data.story.audioUrl);
          } else {
            console.log("No audio URL found for this story");
          }
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
    const result = await markStoryComplete(token, storyId);

    if (result.success) {
      setStory((prev) => ({
        ...prev,
        readingStatus: "completed",
        progressPercentage: 100,
      }));
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 3000);
      
      // Dispatch event to refresh dashboard
      console.log('Dispatching refreshDashboard event from StoryView');
      window.dispatchEvent(refreshDashboardEvent);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const estimateReadingTime = () => {
    if (!story || !story.wordCount) return "Unknown";
    // Average reading speed is 200-250 WPM, using 200 as default
    const minutes = Math.ceil(story.wordCount / 200);
    return `${minutes} min`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: "You",
        text: newComment,
        likes: 0,
        timestamp: "Just now"
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleLikeComment = (commentId) => {
    if (likedComments.has(commentId)) {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      setComments(prev => prev.map(c => 
        c.id === commentId ? {...c, likes: c.likes - 1} : c
      ));
    } else {
      setLikedComments(prev => new Set([...prev, commentId]));
      setComments(prev => prev.map(c => 
        c.id === commentId ? {...c, likes: c.likes + 1} : c
      ));
    }
  };

  const highlightText = (text) => {
    // Simple highlighting for demonstration
    return text.replace(/(culture|tradition|mountain|valley)/gi, '<mark>$1</mark>');
  };

  // Helper function to get absolute audio URL
  const getAudioUrl = (url) => {
    if (!url) return null;
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, it's relative to the domain
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    // Otherwise, assume it's a relative path from the public folder or backend
    // Try backend first (common for Supabase storage URLs)
    if (url.includes('supabase') || url.includes('storage')) {
      return url;
    }
    // Try relative to current origin
    return `${window.location.origin}/${url}`;
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
    <div style={{...styles.page, ...(isFullscreen ? styles.fullscreenPage : {})}}>
      <div style={{...styles.container, ...(isFullscreen ? styles.fullscreenContainer : {})}}>
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
          <div style={styles.imageContainer}>
            <img 
              src={story.image || "/img.png"} 
              alt={story.title} 
              style={styles.headerImage} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800";
              }}
            />
            <div style={styles.imageOverlay}>
              <button style={styles.overlayButton} onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
          
          <div style={styles.headerContent}>
            <div style={styles.headerTop}>
              <div style={styles.badges}>
                <span style={styles.levelBadge}>{story.level}</span>
                {story.isFavorite && (
                  <span style={styles.favoriteBadge}>
                    <Heart size={14} fill="#ef4444" color="#ef4444" />
                  </span>
                )}
              </div>
              <div style={styles.actionButtons}>
                <button style={styles.iconButton} onClick={handleFavorite}>
                  <Heart
                    size={20}
                    color={story.isFavorite ? "#ef4444" : "#fff"}
                    fill={story.isFavorite ? "#ef4444" : "none"}
                  />
                </button>
                <button style={styles.iconButton}>
                  <Share2 size={20} />
                </button>
                <button style={styles.iconButton}>
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
            <h1 style={styles.title}>{story.title}</h1>
            <p style={styles.subtitle}>{story.subtitle}</p>
            <p style={styles.description}>{story.description}</p>

            <div style={styles.meta}>
              {story.createdAt && (
                <span style={styles.metaItem}>
                  <Calendar size={16} /> {new Date(story.createdAt).toLocaleDateString()}
                </span>
              )}
              <span style={styles.metaItem}>
                <Eye size={16} /> {story.readCount || 0} reads
              </span>
              {story.estimatedTime && (
                <span style={styles.metaItem}>
                  <Clock size={16} /> Est. {estimateReadingTime()} read
                </span>
              )}
              {story.wordCount && (
                <span style={styles.metaItem}>
                  <BookOpen size={16} /> {story.wordCount} words
                </span>
              )}
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
        <div style={styles.contentWrapper}>
          <div style={styles.contentActions}>
            <button 
              style={{...styles.tabButton, ...(showComments ? {} : styles.activeTab)}}
              onClick={() => setShowComments(false)}
            >
              Story
            </button>
            <button 
              style={{...styles.tabButton, ...(showComments ? styles.activeTab : {})}}
              onClick={() => setShowComments(true)}
            >
              <MessageCircle size={16} /> Comments ({comments.length})
            </button>
          </div>

          {!showComments ? (
            <div style={styles.content} ref={contentRef}>
              {story.audioUrl && (
                <div style={styles.audioSection}>
                  <div style={styles.audioHeader}>
                    <Volume2 size={20} />
                    <h3>Audio Narration</h3>
                  </div>
                  {audioError ? (
                    <div style={styles.audioError}>
                      <p>Unable to load audio. Please check if the audio file exists.</p>
                      <button 
                        style={styles.retryButton}
                        onClick={() => {
                          setAudioError(false);
                          if (audioRef.current) {
                            audioRef.current.load();
                          }
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <audio 
                      ref={audioRef}
                      controls 
                      style={styles.audio}
                      preload="metadata"
                      onError={(e) => {
                        console.error("Audio error:", e);
                        console.error("Failed to load audio URL:", story.audioUrl);
                        setAudioError(true);
                      }}
                      onLoadStart={() => {
                        console.log("Loading audio from:", getAudioUrl(story.audioUrl));
                        setAudioError(false);
                      }}
                      onCanPlay={() => {
                        console.log("Audio can play");
                        setAudioError(false);
                      }}
                    >
                      <source src={getAudioUrl(story.audioUrl)} type="audio/mpeg" />
                      <source src={getAudioUrl(story.audioUrl)} type="audio/mp3" />
                      <source src={getAudioUrl(story.audioUrl)} type="audio/wav" />
                      <source src={getAudioUrl(story.audioUrl)} type="audio/ogg" />
                      <source src={getAudioUrl(story.audioUrl)} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {story.audioUrl && (
                    <div style={styles.audioInfo}>
                      <a 
                        href={getAudioUrl(story.audioUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.audioLink}
                        onMouseEnter={(e) => e.target.style.opacity = "1"}
                        onMouseLeave={(e) => e.target.style.opacity = "0.8"}
                      >
                        Download Audio
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div
                style={styles.storyContent}
                dangerouslySetInnerHTML={{ __html: highlightText(story.content) }}
              />
            </div>
          ) : (
            <div style={styles.commentsSection}>
              <div style={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this story..."
                  style={styles.commentInput}
                />
                <button 
                  style={styles.commentButton}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={16} /> Post Comment
                </button>
              </div>

              <div style={styles.commentsList}>
                {comments.map(comment => (
                  <div key={comment.id} style={styles.comment}>
                    <div style={styles.commentHeader}>
                      <strong style={styles.commentUser}>{comment.user}</strong>
                      <span style={styles.commentTime}>{comment.timestamp}</span>
                    </div>
                    <p style={styles.commentText}>{comment.text}</p>
                    <div style={styles.commentActions}>
                      <button 
                        style={styles.likeButton}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp 
                          size={16} 
                          color={likedComments.has(comment.id) ? "#3b82f6" : "#94a3b8"} 
                          fill={likedComments.has(comment.id) ? "#3b82f6" : "none"} 
                        />
                        <span style={styles.likeCount}>{comment.likes}</span>
                      </button>
                      <button style={styles.replyButton}>
                        <MessageCircle size={16} /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  fullscreenPage: {
    padding: "20px",
    background: "#0a0f1c",
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
  },
  fullscreenContainer: {
    maxWidth: "100%",
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
  imageContainer: {
    position: "relative",
    marginBottom: 24,
  },
  headerImage: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    borderRadius: 20,
  },
  imageOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  overlayButton: {
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
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
    flexWrap: "wrap",
    gap: 10,
  },
  badges: {
    display: "flex",
    gap: 10,
  },
  levelBadge: {
    background: "#3b82f6",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
  },
  favoriteBadge: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    padding: "6px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  actionButtons: {
    display: "flex",
    gap: 10,
  },
  iconButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#e6edf6",
    transition: "all 0.2s ease",
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
  contentWrapper: {
    marginBottom: 40,
  },
  contentActions: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  tabButton: {
    background: "transparent",
    border: "none",
    padding: "12px 24px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  activeTab: {
    color: "#22d3ee",
    borderBottom: "2px solid #22d3ee",
  },
  content: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 40,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  audioSection: {
    marginBottom: 30,
    padding: 20,
    background: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
  audioHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 600,
  },
  audio: {
    width: "100%",
    outline: "none",
  },
  audioError: {
    padding: 15,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 8,
    color: "#fca5a5",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 10,
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(239, 68, 68, 0.5)",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: 14,
  },
  audioInfo: {
    marginTop: 10,
    textAlign: "center",
  },
  audioLink: {
    color: "#22d3ee",
    textDecoration: "none",
    fontSize: 14,
    opacity: 0.8,
    transition: "opacity 0.2s ease",
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
    "& mark": {
      background: "rgba(34, 211, 238, 0.3)",
      padding: "0 4px",
      borderRadius: 4,
    },
  },
  commentsSection: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  commentForm: {
    display: "flex",
    gap: 15,
    marginBottom: 30,
  },
  commentInput: {
    flex: 1,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "15px 20px",
    color: "#e6edf6",
    fontSize: 16,
    resize: "vertical",
    minHeight: 80,
  },
  commentButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    border: "none",
    borderRadius: 12,
    padding: "0 20px",
    color: "#081018",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  comment: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 600,
  },
  commentTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 15,
  },
  commentActions: {
    display: "flex",
    gap: 15,
  },
  likeButton: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    padding: "5px 10px",
    borderRadius: 8,
    transition: "all 0.2s ease",
  },
  likeCount: {
    fontSize: 14,
  },
  replyButton: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    padding: "5px 10px",
    borderRadius: 8,
    transition: "all 0.2s ease",
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