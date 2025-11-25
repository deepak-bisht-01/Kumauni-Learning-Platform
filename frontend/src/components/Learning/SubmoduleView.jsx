import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import { fetchLesson, completeBlock } from "../../services/api";

export default function SubmoduleView() {
  const { levelId, lessonId, submoduleIndex } = useParams();
  const navigate = useNavigate();
  const [submodule, setSubmodule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState({});
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch the lesson and find the specific submodule
    const fetchSubmodule = async () => {
      try {
        const response = await fetchLesson(token, levelId, lessonId);
        if (response.success && response.lesson) {
          // Find the specific submodule in the lesson's blocks
          const block = response.lesson.blocks.find(b => b.id === submoduleIndex);
          if (block) {
            setSubmodule(block);
            // Check if already completed
            // In a real implementation, you would check the completion status from the API
          } else {
            console.error("Submodule not found");
          }
        } else {
          console.error("Failed to fetch lesson:", response.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching submodule:", error);
        setLoading(false);
      }
    };

    fetchSubmodule();
  }, [levelId, lessonId, submoduleIndex, navigate]);

  const handleBack = () => {
    navigate(`/learning/${levelId}/${lessonId}`);
  };

  const markDone = async (score) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setSubmitting(true);
    try {
      const result = await completeBlock(token, submoduleIndex, score);
      if (result.success) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Error completing submodule:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setCurrent(0);
    setSelected({});
    setAnswer("");
    setScore(0);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading submodule...</div>
      </div>
    );
  }

  if (!submodule) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Submodule not found</div>
      </div>
    );
  }

  // Render the submodule content based on its type
  const renderSubmoduleContent = () => {
    if (submodule.type === "text") {
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>{submodule.title || "Text Content"}</span>
          </div>
          <div 
            style={styles.textContentInner} 
            dangerouslySetInnerHTML={{ __html: submodule.data?.html || "No content available" }} 
          />
          <button 
            style={styles.actionButton} 
            onClick={() => markDone()} 
            disabled={submitting || completed}
          >
            {completed ? "Completed" : "Mark Done"}
          </button>
        </div>
      );
    }

    if (submodule.type === "word_meaning") {
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>{submodule.title || "Word Meanings"}</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(submodule.data?.items || []).map((w, i) => {
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
                <div key={i} style={styles.listItem}>
                  <span>{word}</span>
                  <span style={{ opacity: 0.7 }}>{meaning}</span>
                </div>
              );
            })}
          </div>
          <button 
            style={styles.actionButton} 
            onClick={() => markDone()} 
            disabled={submitting || completed}
          >
            {completed ? "Completed" : "Mark Done"}
          </button>
        </div>
      );
    }

    if (submodule.type === "sentence_making") {
      // Handle different possible data structures for sentence prompts
      let prompts = [];
      
      // Check various possible data structures
      if (submodule.data?.prompts) {
        prompts = submodule.data.prompts;
      } else if (submodule.data?.sentences) {
        prompts = submodule.data.sentences;
      } else if (submodule.prompts) {
        prompts = submodule.prompts;
      } else if (submodule.sentences) {
        prompts = submodule.sentences;
      } else if (submodule.data && Array.isArray(submodule.data)) {
        // If data is an array directly
        prompts = submodule.data;
      } else if (submodule.data) {
        // If it's a single prompt as a string
        prompts = [submodule.data];
      }
      
      // Normalize prompts to ensure consistent structure
      const normalizedPrompts = prompts.map((p, index) => {
        if (typeof p === 'string') {
          return { english: p, kumaoni: "" };
        } else if (p.english && p.kumaoni) {
          return p;
        } else if (p.prompt) {
          return { english: p.prompt, kumaoni: p.translation || p.kumaoni || "" };
        } else {
          // Fallback
          return { english: JSON.stringify(p), kumaoni: "" };
        }
      });
      
      // If no prompts, show completion button
      if (normalizedPrompts.length === 0) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{submodule.title || "Sentence Making"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Practice constructing sentences in Kumauni
            </div>
            <div>No practice sentences available</div>
            <button 
              style={styles.actionButton} 
              onClick={() => markDone()} 
              disabled={submitting || completed}
            >
              {completed ? "Completed" : "Mark Done"}
            </button>
          </div>
        );
      }
      
      // Show sentences one by one (like vocabulary interface)
      if (completed) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{submodule.title || "Sentence Making"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Practice constructing sentences in Kumauni
            </div>
            <div style={styles.vocabCompleted}>
              <div style={styles.vocabCompletedIcon}>🎉</div>
              <h3 style={styles.vocabCompletedTitle}>Sentence Practice Completed!</h3>
              <p style={styles.vocabCompletedText}>You've practiced {normalizedPrompts.length} sentences</p>
            </div>
            <button 
              style={styles.actionButton} 
              onClick={handleRetake}
            >
              Practice Again
            </button>
          </div>
        );
      }
      
      // Show current sentence
      const currentPrompt = normalizedPrompts[current] || normalizedPrompts[0];
      const progress = ((current + 1) / normalizedPrompts.length) * 100;
      
      // Check if answer is correct (case insensitive, trimmed)
      const isCorrect = currentPrompt.kumaoni && 
                        answer.trim().toLowerCase() === currentPrompt.kumaoni.trim().toLowerCase();
      
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>{submodule.title || "Sentence Making"}</span>
          </div>
          <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
            Practice constructing sentences in Kumauni
          </div>
          
          {/* Progress bar */}
          <div style={styles.stepHeader}>
            <span>Sentence {current + 1} of {normalizedPrompts.length}</span>
            <div style={styles.stepBarOuter}>
              <div style={{ ...styles.stepBarInner, width: `${progress}%` }} />
            </div>
          </div>
          
          {/* Sentence display */}
          <div style={styles.vocabWordContainer}>
            <div style={styles.vocabWord}>{currentPrompt.english}</div>
            <div style={styles.vocabMeaning}>Translate to Kumaoni</div>
          </div>
          
          {/* Practice input */}
          <div style={{ marginBottom: 20 }}>
            <textarea 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              style={styles.textarea} 
              placeholder="Write your translation here" 
            />
            
            {/* Check answer button and result */}
            {currentPrompt.kumaoni && (
              <div style={{ marginTop: 10 }}>
                <button 
                  style={{ ...styles.navButton, background: "rgba(59, 130, 246, 0.2)", border: "1px solid #3b82f6" }}
                  onClick={() => {
                    // The check is automatically shown based on the isCorrect state
                  }}
                >
                  Check Answer
                </button>
                
                {/* Show result if answer is provided */}
                {answer.trim() && (
                  <div style={{ 
                    marginTop: 10, 
                    padding: 10, 
                    borderRadius: 8,
                    background: isCorrect ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    border: `1px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                    color: isCorrect ? "#10b981" : "#ef4444"
                  }}>
                    {isCorrect ? (
                      <div>✅ Correct! Well done!</div>
                    ) : (
                      <div>
                        <div>❌ Not quite right</div>
                        <div style={{ marginTop: 5, fontSize: 14 }}>
                          <strong>Correct translation:</strong> {currentPrompt.kumaoni}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button 
              style={{ ...styles.navButton, background: "rgba(255,255,255,0.1)", color: "#e6edf6" }} 
              onClick={() => setCurrent(Math.max(0, current - 1))} 
              disabled={current === 0}
            >
              Previous
            </button>
            
            {current < normalizedPrompts.length - 1 ? (
              <button 
                style={styles.navButton} 
                onClick={() => {
                  // Save current answer before moving to next
                  setCurrent(Math.min(normalizedPrompts.length - 1, current + 1));
                  // Clear answer for next sentence
                  setAnswer("");
                }}
              >
                Next Sentence
              </button>
            ) : (
              <button 
                style={styles.actionButton} 
                onClick={() => markDone()}
              >
                Complete Practice
              </button>
            )}
          </div>
        </div>
      );
    }

    if (submodule.type === "quiz") {
      const raw = submodule.data?.questions || [];
      const normalized = raw.map((q) => {
        const question = q.q ?? q.question ?? q.prompt ?? "";
        const options = q.options ?? q.choices ?? q.answers ?? [];
        let correctIndex = q.correctIndex ?? q.answerIndex;
        if (correctIndex == null && q.answer != null) {
          const idx = options.findIndex((o) => String(o).trim().toLowerCase() === String(q.answer).trim().toLowerCase());
          correctIndex = idx >= 0 ? idx : null;
        }
        return { question, options, correctIndex };
      });
      
      const scoreCalc = () => {
        let s = 0;
        normalized.forEach((q, idx) => { 
          if (q.correctIndex != null && selected[idx] === q.correctIndex) s += 1; 
        });
        return s;
      };
      
      const q = normalized[current];
      const total = normalized.length || 0;
      const canPrev = current > 0;
      const canNext = current < total - 1;
      
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>{submodule.title || "Quiz"}</span>
          </div>
          <div style={styles.stepHeader}>
            <span>Question {current + 1} / {total}</span>
            <div style={styles.stepBarOuter}>
              <div style={{ ...styles.stepBarInner, width: `${total ? ((current + 1) / total) * 100 : 0}%` }} />
            </div>
          </div>
          {q && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>{q.question}</div>
              {q.options && q.options.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {q.options.map((opt, j) => (
                    <label key={j} style={styles.optionRow}>
                      <input 
                        type="radio" 
                        name={`q-${current}`} 
                        checked={selected[current] === j} 
                        onChange={() => setSelected({ ...selected, [current]: j })} 
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea 
                  value={answer} 
                  onChange={(e) => setAnswer(e.target.value)} 
                  style={styles.textarea} 
                  placeholder="Write your answer" 
                />
              )}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button 
              style={{ ...styles.navButton, background: "rgba(255,255,255,0.1)", color: "#e6edf6" }} 
              onClick={() => setCurrent(Math.max(0, current - 1))} 
              disabled={!canPrev}
            >
              Prev
            </button>
            {canNext ? (
              <button 
                style={styles.navButton} 
                onClick={() => setCurrent(Math.min(total - 1, current + 1))} 
                disabled={q?.options?.length > 0 && selected[current] == null}
              >
                Next
              </button>
            ) : (
              <button 
                style={styles.actionButton} 
                onClick={() => markDone(scoreCalc())} 
                disabled={submitting || completed || (q?.options?.length > 0 && selected[current] == null)}
              >
                {completed ? "Completed" : "Submit"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={styles.blockCard}>
        <div style={styles.itemHeader}>
          <span style={styles.itemNumber}>{submodule.title || "Module"}</span>
        </div>
        <button 
          style={styles.actionButton} 
          onClick={() => markDone()} 
          disabled={submitting || completed}
        >
          {completed ? "Completed" : "Mark Done"}
        </button>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={18} /> Back to Lesson
        </button>

        <div style={styles.header}>
          <div style={styles.lessonHeader}>
            <h1 style={styles.title}>Submodule</h1>
            {completed && <CheckCircle size={24} color="#10b981" />}
          </div>
        </div>

        <div style={styles.content}>
          {renderSubmoduleContent()}
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
  content: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  blockCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: "#3b82f6",
  },
  textContentInner: {
    lineHeight: 1.6,
    marginBottom: 20,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  actionButton: {
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
    transition: "all 0.2s",
    marginTop: 20,
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    background: "linear-gradient(180deg, #0b1220 0%, #151129 100%)",
    borderRadius: 24,
    width: "100%",
    maxWidth: 600,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#e6edf6",
    fontSize: 16,
    fontFamily: "Inter, sans-serif",
    resize: "vertical",
    marginBottom: 20,
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stepBarOuter: {
    width: "70%",
    height: 6,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  stepBarInner: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    transition: "width 0.3s ease",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
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