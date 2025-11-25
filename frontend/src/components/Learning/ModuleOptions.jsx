import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Target, ClipboardList, FileText, Book, Edit3, Play, Star, TrendingUp } from "lucide-react";
import { fetchLevelModule } from "../../services/api";

export default function ModuleOptions() {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const [hoveredModule, setHoveredModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Define the module types we want to show
        const moduleTypes = [
          { 
            id: "quizzes", 
            label: "Knowledge Check Quizzes",
            description: "Test your knowledge with multiple-choice questions",
            icon: <ClipboardList size={24} />,
            color: "#3b82f6"
          },
          { 
            id: "word_meanings", 
            label: "Vocabulary Builder",
            description: "Learn essential vocabulary one word at a time",
            icon: <Book size={24} />,
            color: "#10b981"
          },
          { 
            id: "sentence_making", 
            label: "Sentence Construction",
            description: "Practice constructing sentences in Kumaoni",
            icon: <Edit3 size={24} />,
            color: "#8b5cf6"
          },
          { 
            id: "daily_words", 
            label: "Daily Vocabulary",
            description: "Learn commonly used words daily",
            icon: <FileText size={24} />,
            color: "#f59e0b"
          },
        ];

        // For each module type, fetch the count of items
        const moduleData = await Promise.all(moduleTypes.map(async (module) => {
          try {
            const response = await fetchLevelModule(token, levelId, module.id);
            if (response.success) {
              return {
                ...module,
                count: response.items?.length || 0,
                xp: module.id === "quizzes" ? "50 XP per quiz" : 
                     module.id === "word_meanings" ? "20 XP per session" : 
                     module.id === "sentence_making" ? "30 XP per session" : 
                     "10 XP per word"
              };
            }
          } catch (error) {
            console.error(`Error fetching ${module.id}:`, error);
          }
          return {
            ...module,
            count: 0,
            xp: module.id === "quizzes" ? "50 XP per quiz" : 
                 module.id === "word_meanings" ? "20 XP per session" : 
                 module.id === "sentence_making" ? "30 XP per session" : 
                 "10 XP per word"
          };
        }));

        setModules(moduleData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading modules:", error);
        setLoading(false);
      }
    };

    loadModules();
  }, [levelId, navigate]);

  const getLevelName = () => {
    const levelNames = {
      beginner: "Beginner",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      expert: "Expert"
    };
    return levelNames[levelId] || levelId;
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading modules...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/learning")}>
          <ArrowLeft size={18} /> Back to Levels
        </button>
        
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.levelBadge}>{getLevelName()} Level</div>
            <h1 style={styles.title}>Learning Modules</h1>
            <p style={styles.subtitle}>Choose a module to practice specific skills and earn XP</p>
          </div>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            <div style={styles.progressText}>0/100% Complete</div>
          </div>
        </div>
        
        <div style={styles.grid}>
          {modules.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.moduleCard,
                ...(hoveredModule === m.id ? styles.moduleCardHover : {}),
                border: `2px solid ${m.color}40`,
                background: `linear-gradient(135deg, ${m.color}20 0%, ${m.color}10 100%)`
              }}
              onMouseEnter={() => setHoveredModule(m.id)}
              onMouseLeave={() => setHoveredModule(null)}
              onClick={() => navigate(`/learning/${levelId}/module/${m.id}`)}
            >
              <div style={{ ...styles.moduleIcon, background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                {m.icon}
              </div>
              
              <div style={styles.moduleContent}>
                <h3 style={styles.moduleLabel}>{m.label}</h3>
                <p style={styles.moduleDescription}>{m.description}</p>
                
                <div style={styles.moduleStats}>
                  <div style={styles.statItem}>
                    <Play size={16} color={m.color} />
                    <span>{m.count} Items</span>
                  </div>
                  <div style={styles.statItem}>
                    <Star size={16} color={m.color} fill={m.color} />
                    <span>{m.xp}</span>
                  </div>
                </div>
                
                <button 
                  style={{ ...styles.startButton, background: m.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/learning/${levelId}/module/${m.id}`);
                  }}
                >
                  Start Learning <Play size={16} />
                </button>
              </div>
              
              {hoveredModule === m.id && (
                <div style={styles.hoverEffect}></div>
              )}
            </div>
          ))}
        </div>
        
        <div style={styles.achievementsPreview}>
          <h3 style={styles.achievementsTitle}>Upcoming Achievements</h3>
          <div style={styles.achievementsGrid}>
            <div style={styles.achievementCard}>
              <TrendingUp size={20} color="#f59e0b" />
              <div>
                <div style={styles.achievementName}>First Steps</div>
                <div style={styles.achievementDesc}>Complete 5 modules</div>
              </div>
            </div>
            <div style={styles.achievementCard}>
              <Star size={20} color="#3b82f6" fill="#3b82f6" />
              <div>
                <div style={styles.achievementName}>Word Master</div>
                <div style={styles.achievementDesc}>Learn 50 vocabulary words</div>
              </div>
            </div>
          </div>
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
    margin: "0 auto" 
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
    transition: "all 0.2s",
  },
  header: {
    marginBottom: 40,
    textAlign: "center",
  },
  headerContent: {
    marginBottom: 20,
  },
  levelBadge: {
    display: "inline-block",
    background: "rgba(139, 92, 246, 0.2)",
    border: "1px solid rgba(139, 92, 246, 0.4)",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#c4b5fd",
    marginBottom: 16,
  },
  title: { 
    fontSize: 36, 
    fontWeight: 800, 
    margin: "0 0 12px 0",
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    maxWidth: 600,
    margin: "0 auto",
  },
  progressContainer: {
    maxWidth: 600,
    margin: "0 auto",
  },
  progressBar: {
    width: "100%",
    height: 10,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    width: "30%",
    height: "100%",
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loading: {
    textAlign: "center",
    fontSize: 18,
    color: "#7f5af0",
    padding: "60px 20px",
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
    gap: 24,
    marginBottom: 40,
  },
  moduleCard: {
    position: "relative",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },
  moduleCardHover: {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 32px rgba(0,0,0,0.4)",
  },
  moduleIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  moduleContent: {
    position: "relative",
    zIndex: 2,
  },
  moduleLabel: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 12px 0",
    color: "#e6edf6",
  },
  moduleDescription: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  moduleStats: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    opacity: 0.9,
  },
  startButton: {
    width: "100%",
    padding: "12px 20px",
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
    transition: "all 0.2s",
  },
  hoverEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.05)",
    zIndex: 1,
  },
  achievementsPreview: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  achievementsTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 20px 0",
    textAlign: "center",
  },
  achievementsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },
  achievementCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
};