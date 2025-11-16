import React, { useEffect, useState } from "react";
import {
  User,
  Settings,
  Lightbulb,
  Book,
  Languages,
  Star,
  ChevronRight,
  LogOut,
  Trophy,
  BookOpen,
  X,
  TrendingUp,
  Award,
  Target,
  Sparkles,
} from "lucide-react";
import { fetchDashboardOverview } from "../../services/api";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import DailyQuiz from "../Quiz/DailyQuiz";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDailyQuiz, setShowDailyQuiz] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErr("Not logged in.");
      return;
    }

    // Get user info from localStorage
    const user = authService.getCurrentUser();
    setUserInfo(user);

    fetchDashboardOverview(token)
      .then((json) => {
        if (!json.success) throw new Error(json.message || "Failed to fetch");
        setData(json);
      })
      .catch((e) => {
        console.error("Dashboard fetch error:", e);
        setErr(e.message);
      });
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleModalBackdropClick = (e) => {
    // Close modal if clicking on the backdrop (not the content)
    if (e.target === e.currentTarget) {
      setShowProfile(false);
    }
  };

  if (err)
    return (
      <div style={styles.page}>
        <div style={styles.error}>{err}</div>
        <button
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );

  if (!data)
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading dashboard…</div>
      </div>
    );

  // Handle both possible API response structures
  const progressSummary = data.data?.progressSummary || data.progressSummary || {
    lessonsCompleted: 0,
    flashcardsReviewed: 0,
    xp: 0,
  };
  const achievements = data.data?.achievements || data.achievements || [];
  const user = userInfo || data.user || data.data?.user || { full_name: "User", email: "" };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.headerGrid}>
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeHeader}>
              <div>
                <div style={styles.welcomeTitle}>
                  Welcome back, {user.full_name?.split(" ")[0] || user.full_name || "User"}! 👋
                </div>
                <div style={styles.subText}>Continue your learning adventure</div>
              </div>
              <div style={styles.welcomeIcon}>
                <Sparkles size={32} color="#22d3ee" />
              </div>
            </div>
          </div>

          <div 
            style={{
              ...styles.profileCard,
              ...(hoveredCard === 'profile' ? styles.profileCardHover : {})
            }} 
            onClick={() => setShowProfile(!showProfile)}
            onMouseEnter={() => setHoveredCard('profile')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.profileRow}>
              <div style={styles.profileAvatarSmall}>
                <User size={18} color="#fff" />
              </div>
              <span>{user.full_name || "KumaoniExplorer"}</span>
              <Settings size={18} color="#bbb" style={{ marginLeft: "auto", cursor: "pointer" }} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(34,211,238,0.3)";
              e.currentTarget.style.border = "1px solid rgba(34,211,238,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            <div style={styles.statIcon("#22d3ee")}>
              <Star size={24} color="#22d3ee" fill="#22d3ee" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{progressSummary.xp || 0}</div>
              <div style={styles.statLabel}>Total XP</div>
            </div>
            <div style={styles.statTrend}>
              <TrendingUp size={16} color="#10b981" />
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(59,130,246,0.3)";
              e.currentTarget.style.border = "1px solid rgba(59,130,246,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            <div style={styles.statIcon("#3b82f6")}>
              <BookOpen size={24} color="#3b82f6" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{progressSummary.lessonsCompleted || 0}</div>
              <div style={styles.statLabel}>Lessons Completed</div>
            </div>
            <div style={styles.statTrend}>
              <Target size={16} color="#10b981" />
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(16,185,129,0.3)";
              e.currentTarget.style.border = "1px solid rgba(16,185,129,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            <div style={styles.statIcon("#10b981")}>
              <Book size={24} color="#10b981" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{progressSummary.flashcardsReviewed || 0}</div>
              <div style={styles.statLabel}>Stories Read</div>
            </div>
            <div style={styles.statTrend}>
              <Award size={16} color="#10b981" />
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(245,158,11,0.3)";
              e.currentTarget.style.border = "1px solid rgba(245,158,11,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            <div style={styles.statIcon("#f59e0b")}>
              <Trophy size={24} color="#f59e0b" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{achievements?.length || 0}</div>
              <div style={styles.statLabel}>Achievements</div>
            </div>
            <div style={styles.statTrend}>
              <Trophy size={16} color="#f59e0b" />
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <div style={styles.profileModal} onClick={handleModalBackdropClick}>
            <div style={styles.profileModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.profileModalHeader}>
                <h2 style={styles.profileModalTitle}>Profile</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowProfile(false)}
                  aria-label="Close profile"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={styles.profileInfo}>
                <div style={styles.profileAvatar}>
                  <User size={32} color="#fff" />
                </div>
                <div style={styles.profileDetails}>
                  <h3 style={styles.profileName}>{user.full_name || "User"}</h3>
                  <p style={styles.profileEmail}>{user.email || ""}</p>
                </div>
              </div>

              {/* Progress Section */}
              <div style={styles.progressSection}>
                <h3 style={styles.progressTitle}>Your Progress</h3>
                
                <div style={styles.progressItem}>
                  <div style={styles.progressItemHeader}>
                    <Star size={18} color="#facc15" fill="#facc15" />
                    <span>Total XP</span>
                  </div>
                  <span style={styles.progressValue}>{progressSummary.xp || 0} XP</span>
                </div>

                <div style={styles.progressItem}>
                  <div style={styles.progressItemHeader}>
                    <BookOpen size={18} color="#3b82f6" />
                    <span>Lessons Completed</span>
                  </div>
                  <span style={styles.progressValue}>{progressSummary.lessonsCompleted || 0}</span>
                </div>

                <div style={styles.progressItem}>
                  <div style={styles.progressItemHeader}>
                    <Book size={18} color="#10b981" />
                    <span>Stories Read</span>
                  </div>
                  <span style={styles.progressValue}>{progressSummary.flashcardsReviewed || 0}</span>
                </div>

                {achievements && achievements.length > 0 && (
                  <div style={styles.achievementsSection}>
                    <div style={styles.progressItemHeader}>
                      <Trophy size={18} color="#f59e0b" />
                      <span>Achievements</span>
                    </div>
                    <div style={styles.achievementsList}>
                      {achievements.slice(0, 3).map((ach) => (
                        <div key={ach.id || ach.name} style={styles.achievementBadge}>
                          {ach.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button style={styles.logoutButton} onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Start Learning Section */}
        <div 
          style={{
            ...styles.startLearningCard,
            ...(hoveredCard === 'start' ? styles.startLearningCardHover : {})
          }}
          onMouseEnter={() => setHoveredCard('start')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.startLearningContent}>
            <div style={styles.startLearningHeader}>
              <div style={styles.startLearningIcon}>
                <Target size={32} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, fontWeight: 600, letterSpacing: "1px" }}>
                  START LEARNING
                </div>
                <div style={styles.lessonTitle}>Begin Your Kumaoni Journey</div>
                <div style={{ opacity: 0.7, marginTop: 8, fontSize: 15 }}>
                  Choose your level and start learning Kumaoni step by step
                </div>
              </div>
            </div>
            <button
              style={styles.startButton}
              onClick={() => navigate("/learning")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(34,211,238,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,211,238,0.3)";
              }}
            >
              START LEARNING <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={styles.featureGrid}>
          {/* Daily Quiz */}
          <div 
            style={{
              ...styles.featureCard("#3b82f6", "#60a5fa"),
              ...(hoveredCard === 'quiz' ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('quiz')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon("#3b82f6")}>
              <Lightbulb size={32} color="#fff" />
            </div>
            <div style={styles.featureTitle}>Daily Quiz</div>
            <div style={styles.featureDescription}>Test your knowledge with daily challenges</div>
            <button 
              style={styles.smallButton("#3b82f6")}
              onClick={() => setShowDailyQuiz(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.4)";
              }}
            >
              Start Quiz
            </button>
          </div>

          {/* Kumaoni Stories */}
          <div 
            style={{
              ...styles.featureCard("#f97316", "#fb923c"),
              ...(hoveredCard === 'stories' ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('stories')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon("#f97316")}>
              <Book size={32} color="#fff" />
            </div>
            <div style={styles.featureTitle}>Kumaoni Stories</div>
            <div style={styles.featureDescription}>Explore traditional tales and folklore</div>
            <button
              style={styles.smallButton("#f97316")}
              onClick={() => navigate("/stories")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,115,22,0.4)";
              }}
            >
              Read Story
            </button>
          </div>

          {/* Translator */}
          <div 
            style={{
              ...styles.featureCard("#06b6d4", "#67e8f9"),
              ...(hoveredCard === 'translator' ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('translator')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon("#06b6d4")}>
              <Languages size={32} color="#fff" />
            </div>
            <div style={styles.featureTitle}>Translator</div>
            <div style={styles.featureDescription}>Translate between languages instantly</div>
            <button
              style={styles.smallButton("#06b6d4")}
              onClick={() => navigate("/translator")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(6,182,212,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(6,182,212,0.4)";
              }}
            >
              Open Translator
            </button>
          </div>
        </div>

        {/* Learning Path */}
        <div 
          style={styles.learningCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
            e.currentTarget.style.border = "1px solid rgba(34,211,238,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
          }}
        >
          <div style={styles.learningHeader}>
            <div style={styles.learningHeaderLeft}>
              <Target size={20} color="#22d3ee" />
              <span style={{ fontSize: 20, fontWeight: 700 }}>Learning Path</span>
            </div>
            <div style={styles.xpText}>
              <Star size={18} color="#facc15" fill="#facc15" /> 
              <span style={{ fontWeight: 700 }}>{progressSummary.xp || 0} XP</span>
            </div>
          </div>

          <div style={styles.progressBarContainer}>
            {Array(6)
              .fill(0)
              .map((_, i) => {
                const isCompleted = i <= 3;
                return (
                  <div key={i} style={styles.progressStepContainer}>
                    <div
                      style={{
                        ...styles.progressCircle,
                        background: isCompleted
                          ? "radial-gradient(circle, #22d3ee 0%, #0ea5e9 100%)"
                          : "rgba(255,255,255,0.08)",
                        boxShadow: isCompleted
                          ? "0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.3)"
                          : "none",
                        border: isCompleted
                          ? "2px solid rgba(34,211,238,0.5)"
                          : "2px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    {isCompleted && (
                      <div style={styles.progressCheckmark}>
                        <span style={{ fontSize: 10, fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            <div style={styles.progressLine} />
          </div>

          <div style={styles.progressInfo}>
            <div style={styles.progressText}>
              <span style={{ fontWeight: 700 }}>Module 1: Greetings & Basics</span>
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressBarFill} />
            </div>
            <div style={styles.progressPercentage}>75% Complete</div>
          </div>
        </div>
      </div>

      {/* Daily Quiz Modal */}
      <DailyQuiz isOpen={showDailyQuiz} onClose={() => setShowDailyQuiz(false)} />
    </div>
  );
}

/* --------------------------
🎨 Styles
-------------------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b1220 0%, #0a0f1c 40%, #151129 100%)",
    color: "#e6edf6",
    fontFamily: "Inter, sans-serif",
    padding: "80px 20px",
    display: "flex",
    justifyContent: "center",
  },
  container: { width: "100%", maxWidth: 1000, position: "relative" },
  headerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
    marginBottom: 30,
  },
  welcomeCard: {
    background: "linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(139,92,246,0.1) 100%)",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    transition: "all 0.3s ease",
  },
  welcomeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTitle: { 
    fontSize: 28, 
    fontWeight: 700,
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 8,
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(139,92,246,0.2) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(34,211,238,0.3)",
  },
  subText: { 
    opacity: 0.8,
    fontSize: 16,
  },
  profileCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  profileCardHover: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(34,211,238,0.3)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(34,211,238,0.2)",
  },
  profileAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 500,
  },
  profileModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  profileModalContent: {
    background: "linear-gradient(180deg, #0b1220 0%, #151129 100%)",
    borderRadius: 24,
    padding: 30,
    maxWidth: 500,
    width: "100%",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  profileModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  profileModalTitle: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  closeButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
    color: "#e6edf6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  profileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 30,
    paddingBottom: 24,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 4px 0",
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
    margin: 0,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },
  progressItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  progressItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    opacity: 0.8,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#22d3ee",
  },
  achievementsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  achievementsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  achievementBadge: {
    background: "rgba(245, 158, 11, 0.2)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#f59e0b",
  },
  logoutButton: {
    width: "100%",
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: "14px 20px",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontSize: 16,
    fontWeight: 600,
    transition: "all 0.2s",
    marginTop: 20,
  },
  lessonTitle: { fontSize: 22, fontWeight: 700, margin: "6px 0 10px" },
  startButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#081018",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 24px rgba(34,211,238,0.3)",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  featureCard: (color1, color2) => ({
    background: `linear-gradient(135deg, ${color1}20 0%, ${color2}15 100%)`,
    borderRadius: 20,
    padding: 24,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  }),
  featureCardHover: {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  featureIcon: (color) => ({
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}40 0%, ${color}30 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    border: `1px solid ${color}50`,
  }),
  featureTitle: { 
    fontSize: 18, 
    fontWeight: 700, 
    margin: "0 0 8px 0",
    color: "#e6edf6",
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  smallButton: (color) => ({
    padding: "10px 20px",
    borderRadius: 12,
    border: "none",
    background: `${color}`,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: `0 6px 20px ${color}40`,
    transition: "all 0.3s ease",
    width: "100%",
  }),
  learningCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  learningHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  learningHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 20,
    fontWeight: 700,
  },
  xpText: {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#facc15",
  },
  progressBarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    marginBottom: 24,
    padding: "0 8px",
  },
  progressStepContainer: {
    position: "relative",
    zIndex: 2,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    zIndex: 2,
    transition: "all 0.3s ease",
  },
  progressCheckmark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#fff",
    zIndex: 3,
  },
  progressLine: {
    position: "absolute",
    top: 11,
    left: 20,
    right: 20,
    height: 4,
    background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
    zIndex: 1,
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(34,211,238,0.4)",
  },
  progressInfo: {
    marginTop: 20,
  },
  progressText: { 
    fontSize: 16, 
    opacity: 0.9,
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    width: "75%",
    height: "100%",
    background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(34,211,238,0.5)",
    transition: "width 0.3s ease",
  },
  progressPercentage: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: 600,
    color: "#22d3ee",
  },
  loading: { color: "#7f5af0", fontSize: 18 },
  error: { 
    color: "#f87171", 
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: 8,
    padding: "10px 20px",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  statCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  statIcon: (color) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: `${color}20`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${color}30`,
  }),
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#e6edf6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: 500,
  },
  statTrend: {
    opacity: 0.8,
  },
  startLearningCard: {
    background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)",
    borderRadius: 24,
    padding: 32,
    marginBottom: 30,
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(139,92,246,0.2)",
    transition: "all 0.3s ease",
  },
  startLearningCardHover: {
    background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)",
    border: "1px solid rgba(139,92,246,0.4)",
    boxShadow: "0 16px 48px rgba(139,92,246,0.3)",
    transform: "translateY(-4px)",
  },
  startLearningContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
  },
  startLearningHeader: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  startLearningIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.2) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(139,92,246,0.4)",
  },
};
