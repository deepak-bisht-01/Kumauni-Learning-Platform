import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Star, CheckCircle, Clock, Trophy, Book, Edit3, FileText } from "lucide-react";
import { fetchLevelModule } from "../../services/api";

export default function ModuleView() {
  const { levelId, type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    const loadModuleContent = async () => {
      try {
        const response = await fetchLevelModule(token, levelId, type);
        if (response.success) {
          setItems(response.items || []);
        } else {
          console.error("Failed to fetch module content:", response.message);
        }
      } catch (error) {
        console.error("Error fetching module content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModuleContent();
  }, [levelId, type, navigate]);

  const titleMap = {
    quizzes: "Knowledge Check Quizzes",
    word_meanings: "Vocabulary Builder",
    sentence_making: "Sentence Construction",
    daily_words: "Daily Vocabulary",
  };

  const descriptionMap = {
    quizzes: "Test your knowledge with multiple-choice questions",
    word_meanings: "Learn essential vocabulary one word at a time",
    sentence_making: "Practice constructing sentences in Kumaoni",
    daily_words: "Learn commonly used words daily",
  };

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

  const getModuleIcon = () => {
    switch (type) {
      case "quizzes": return <Trophy size={24} />;
      case "word_meanings": return <Book size={24} />;
      case "sentence_making": return <Edit3 size={24} />;
      case "daily_words": return <FileText size={24} />;
      default: return <Play size={24} />;
    }
  };

  const getModuleColor = () => {
    switch (type) {
      case "quizzes": return "#3b82f6";
      case "word_meanings": return "#10b981";
      case "sentence_making": return "#8b5cf6";
      case "daily_words": return "#f59e0b";
      default: return "#22d3ee";
    }
  };

  const getTotalXP = () => {
    if (type === "quizzes") {
      return items.reduce((total, item) => total + ((item.questions_count || 5) * 10), 0);
    }
    return items.length * 10; // 10 XP per item for other modules
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(`/learning/${levelId}/modules`)}>
          <ArrowLeft size={18} /> Back to Modules
        </button>
        
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.moduleIcon, background: `${getModuleColor()}20`, border: `1px solid ${getModuleColor()}40` }}>
              {getModuleIcon()}
            </div>
            <div>
              <div style={styles.levelBadge}>{getLevelName()} Level</div>
              <h1 style={styles.title}>{titleMap[type] || "Learning Module"}</h1>
              <p style={styles.description}>{descriptionMap[type] || "Complete this learning module"}</p>
            </div>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statBox}>
              <Clock size={20} color={getModuleColor()} />
              <div>
                <div style={styles.statNumber}>{items.length}</div>
                <div style={styles.statLabel}>Items</div>
              </div>
            </div>
            <div style={styles.statBox}>
              <Star size={20} color={getModuleColor()} fill={getModuleColor()} />
              <div>
                <div style={styles.statNumber}>{getTotalXP()}</div>
                <div style={styles.statLabel}>XP</div>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading content...</div>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No Content Available</h3>
            <p style={styles.emptyDescription}>We're working on adding new content for this module. Check back soon!</p>
            <button 
              style={{ ...styles.backButton, marginTop: 20 }}
              onClick={() => navigate(`/learning/${levelId}/modules`)}
            >
              Back to Modules
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map((item, index) => (
              <div
                key={item.id} 
                style={{
                  ...styles.card,
                  ...(hoveredItem === item.id ? styles.cardHover : {}),
                  border: `1px solid ${getModuleColor()}30`,
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                  // For quizzes, navigate to the quiz view
                  if (type === "quizzes") {
                    navigate(`/learning/${levelId}/quiz/${item.id}`);
                  } else {
                    // For other modules, navigate to the module item view
                    navigate(`/learning/${levelId}/module/${type}/${encodeURIComponent(item.id)}`);
                  }
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.itemNumber}>Item {index + 1}</div>
                  {item.completed && (
                    <CheckCircle size={20} color="#10b981" />
                  )}
                </div>
                
                <h3 style={styles.cardTitle}>
                  {item.title || item.english_word || `Practice Session ${index + 1}`}
                </h3>
                
                {type === "quizzes" && (
                  <div style={styles.cardMeta}>
                    <div style={styles.metaItem}>
                      <Play size={16} color={getModuleColor()} />
                      <span>{item.questions_count || 5} Questions</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Star size={16} color={getModuleColor()} fill={getModuleColor()} />
                      <span>{(item.questions_count || 5) * 10} XP</span>
                    </div>
                  </div>
                )}
                
                {type === "word_meanings" && item.data?.items && (
                  <div style={styles.vocabPreview}>
                    {item.data.items.length > 0 ? (
                      <>
                        {item.data.items.slice(0, 3).map((w, i) => {
                          // Handle different word object structures
                          let word = "";
                          let meaning = "";
                          
                          if (typeof w === 'string') {
                            word = w;
                            meaning = "Translation not available";
                          } else if (w.english && w.kumaoni) {
                            word = w.english;
                            meaning = w.kumaoni;
                          } else if (w.word && w.meaning) {
                            word = w.word;
                            meaning = w.meaning;
                          } else if (w.english_word && w.kumaoni_word) {
                            word = w.english_word;
                            meaning = w.kumaoni_word;
                          } else {
                            // Fallback for any other structure
                            word = Object.values(w)[0] || "Word";
                            meaning = Object.values(w)[1] || "Translation not available";
                          }
                          
                          return (
                            <div key={i} style={styles.vocabItem}>
                              <span style={styles.vocabWord}>{word}</span>
                              <span style={styles.vocabMeaning}>{meaning}</span>
                            </div>
                          );
                        })}
                        {item.data.items.length > 3 && (
                          <div style={styles.moreWords}>+{item.data.items.length - 3} more words</div>
                        )}
                      </>
                    ) : (
                      <div style={styles.noWords}>Learn essential vocabulary and their translations</div>
                    )}
                  </div>
                )}
                
                {type === "sentence_making" && item.data?.prompts && (
                  <div style={styles.promptsPreview}>
                    {item.data.prompts.slice(0, 2).map((p, i) => {
                      // Handle different prompt object structures
                      let promptText = "";
                      if (typeof p === 'string') {
                        promptText = p;
                      } else if (p.prompt) {
                        promptText = p.prompt;
                      } else if (p.question) {
                        promptText = p.question;
                      } else if (p.sentence) {
                        promptText = p.sentence;
                      } else {
                        promptText = JSON.stringify(p);
                      }
                      
                      return (
                        <div key={i} style={styles.promptItem}>{promptText}</div>
                      );
                    })}
                  </div>
                )}
                
                {type === "daily_words" && (
                  <div style={styles.dailyWordPreview}>
                    {item.english_word && item.kumaoni_word ? (
                      <div style={styles.wordPair}>
                        <span style={styles.englishWord}>{item.english_word}</span>
                        <span style={styles.kumaoniWord}>{item.kumaoni_word}</span>
                      </div>
                    ) : item.data?.items ? (
                      <>
                        {item.data.items.slice(0, 3).map((w, i) => {
                          // Handle different word object structures
                          let word = "";
                          let meaning = "";
                          
                          if (typeof w === 'string') {
                            word = w;
                            meaning = "Translation not available";
                          } else if (w.english && w.kumaoni) {
                            word = w.english;
                            meaning = w.kumaoni;
                          } else if (w.word && w.meaning) {
                            word = w.word;
                            meaning = w.meaning;
                          } else if (w.english_word && w.kumaoni_word) {
                            word = w.english_word;
                            meaning = w.kumaoni_word;
                          } else {
                            // Fallback for any other structure
                            word = Object.values(w)[0] || "Word";
                            meaning = Object.values(w)[1] || "Translation not available";
                          }
                          
                          return (
                            <div key={i} style={styles.vocabItem}>
                              <span style={styles.vocabWord}>{word}</span>
                              <span style={styles.vocabMeaning}>{meaning}</span>
                            </div>
                          );
                        })}
                        {item.data.items.length > 3 && (
                          <div style={styles.moreWords}>+{item.data.items.length - 3} more words</div>
                        )}
                      </>
                    ) : (
                      <div style={styles.noWords}>Learn commonly used words daily</div>
                    )}
                  </div>
                )}

                <button 
                  style={{ ...styles.startButton, background: getModuleColor() }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // For quizzes, navigate to the quiz view
                    if (type === "quizzes") {
                      navigate(`/learning/${levelId}/quiz/${item.id}`);
                    } else {
                      // For other modules, navigate to the module item view
                      navigate(`/learning/${levelId}/module/${type}/${encodeURIComponent(item.id)}`);
                    }
                  }}
                >
                  {item.completed ? "Review" : "Start"} <Play size={16} />
                </button>
                
                {hoveredItem === item.id && (
                  <div style={styles.cardHoverEffect}></div>
                )}
              </div>
            ))}
          </div>
        )}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    gap: 20,
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadge: {
    display: "inline-block",
    background: "rgba(139, 92, 246, 0.2)",
    border: "1px solid rgba(139, 92, 246, 0.4)",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#c4b5fd",
    marginBottom: 8,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 800, 
    margin: "0 0 8px 0",
  },
  description: { 
    fontSize: 16, 
    opacity: 0.8,
    maxWidth: 500,
    margin: 0,
  },
  headerStats: {
    display: "flex",
    gap: 20,
  },
  statBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: "#e6edf6",
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  loading: {
    textAlign: "center",
    fontSize: 18,
    color: "#7f5af0",
    padding: "60px 20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 12px 0",
  },
  emptyDescription: {
    fontSize: 16,
    opacity: 0.7,
    maxWidth: 500,
    margin: "0 auto 20px auto",
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: 24 
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 16px 0",
    color: "#e6edf6",
  },
  cardMeta: {
    display: "flex",
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    opacity: 0.8,
  },
  vocabPreview: {
    marginBottom: 20,
  },
  vocabItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  vocabWord: {
    fontWeight: 600,
    color: "#3b82f6",
  },
  vocabMeaning: {
    opacity: 0.8,
  },
  moreWords: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "right",
    marginTop: 8,
  },
  noWords: {
    fontStyle: "italic",
    opacity: 0.7,
    padding: "10px 0",
  },
  promptsPreview: {
    marginBottom: 20,
  },
  promptItem: {
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontSize: 14,
    opacity: 0.8,
  },
  dailyWordPreview: {
    marginBottom: 20,
  },
  wordPair: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  englishWord: {
    fontSize: 20,
    fontWeight: 700,
    color: "#3b82f6",
  },
  kumaoniWord: {
    fontSize: 18,
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
  cardHoverEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.05)",
    zIndex: 1,
  },
};