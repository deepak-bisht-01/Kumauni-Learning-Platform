import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Star, RotateCcw, Eye } from "lucide-react";
import { fetchLevelModule, completeModuleItem } from "../../services/api";

// Add a custom event for dashboard refresh
// Using a more robust approach for creating custom events
const refreshDashboardEvent = new CustomEvent('refreshDashboard');

export default function ModuleItemView() {
  const { levelId, type, itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState({});
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch the module items and find the specific item
    const fetchModuleItem = async () => {
      try {
        const response = await fetchLevelModule(token, levelId, type);
        if (response.success && response.items) {
          // Find the specific item - we need to handle different ID types
          // The itemId might be a string but the item.id might be a number
          const foundItem = response.items.find(i => 
            i.id === itemId || 
            i.id === parseInt(itemId) || 
            String(i.id) === itemId
          );
          
          if (foundItem) {
            setItem(foundItem);
            // Check if already completed
            // In a real implementation, you would check the completion status from the API
          } else {
            console.error("Module item not found", { itemId, items: response.items });
          }
        } else {
          console.error("Failed to fetch module:", response.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching module item:", error);
        setLoading(false);
      }
    };

    fetchModuleItem();
  }, [levelId, type, itemId, navigate]);

  const handleBack = () => {
    navigate(`/learning/${levelId}/module/${type}`);
  };

  const markDone = async (quizScore = 0) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setSubmitting(true);
    try {
      // Use the new completeModuleItem function
      const result = await completeModuleItem(token, itemId, quizScore);
      if (result.success) {
        setCompleted(true);
        // Calculate XP based on score
        const earnedXp = quizScore * 10; // 10 XP per correct answer
        setXpEarned(earnedXp);
        setScore(quizScore);
        // For quizzes, also set the total questions
        if (type === "quizzes") {
          const questions = item.data?.questions || item.questions || [];
          setTotalQuestions(questions.length);
        }
        
        // Dispatch event to refresh dashboard
        console.log('Dispatching refreshDashboard event from ModuleItemView');
        window.dispatchEvent(refreshDashboardEvent);
      }
    } catch (error) {
      console.error("Error completing module item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = () => {
    setShowReview(true);
    setCurrent(0);
    setSelected({});
  };

  const handleRetake = () => {
    setShowReview(false);
    setCurrent(0);
    setSelected({});
    setAnswer("");
    setScore(0);
    setXpEarned(0);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading module item...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Module item not found. Please go back and try again.</div>
        <button style={styles.actionButton} onClick={handleBack}>Back to Module</button>
      </div>
    );
  }

  // Render the module item content based on its type
  const renderModuleItemContent = () => {
    if (!item) return null;
    
    if (type === "quizzes") {
      // Handle quiz items
      // Check different possible sources of questions
      const questions = item.data?.questions || item.questions || [];
      
      if (showReview) {
        // Review mode - show all questions with user answers and correct answers
        const normalized = questions.map((q) => {
          const question = q.q ?? q.question ?? q.prompt ?? "";
          const options = q.options ?? q.choices ?? q.answers ?? [];
          let correctIndex = q.correctIndex ?? q.answerIndex;
          if (correctIndex == null && q.answer != null) {
            const idx = options.findIndex((o) => String(o).trim().toLowerCase() === String(q.answer).trim().toLowerCase());
            correctIndex = idx >= 0 ? idx : null;
          }
          return { question, options, correctIndex };
        });
        
        const q = normalized[current];
        const total = normalized.length || 0;
        const canPrev = current > 0;
        const canNext = current < total - 1;
        const userAnswer = selected[current];
        const isCorrect = userAnswer === q.correctIndex;
        
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{item.title || "Quiz Review"}</span>
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
                    {q.options.map((opt, j) => {
                      let optionStyle = { ...styles.optionRow };
                      let indicator = null;
                      
                      if (j === q.correctIndex) {
                        // Correct answer - green
                        optionStyle = { 
                          ...styles.optionRow, 
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "2px solid #10b981"
                        };
                        indicator = <CheckCircle size={16} color="#10b981" />;
                      } else if (j === userAnswer) {
                        // User's answer
                        if (!isCorrect) {
                          // Wrong answer - red
                          optionStyle = { 
                            ...styles.optionRow, 
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "2px solid #ef4444"
                          };
                        } else {
                          // Correct user answer - green
                          optionStyle = { 
                            ...styles.optionRow, 
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "2px solid #10b981"
                          };
                        }
                      }
                      
                      return (
                        <label key={j} style={optionStyle}>
                          <input 
                            type="radio" 
                            name={`q-${current}`} 
                            checked={j === userAnswer}
                            disabled
                          />
                          <span>{opt}</span>
                          {indicator && (
                            <span style={{ 
                              marginLeft: "auto", 
                              fontWeight: "bold",
                              color: j === q.correctIndex ? "#10b981" : "#ef4444"
                            }}>
                              {j === q.correctIndex ? "✓ Correct" : "✗ Your Answer"}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div>Your answer:</div>
                    <div style={{
                      padding: 12,
                      background: isCorrect ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                      borderRadius: 8,
                      margin: "8px 0"
                    }}>
                      {answer || "No answer provided"}
                    </div>
                    {q.answer && !isCorrect && (
                      <>
                        <div>Correct answer:</div>
                        <div style={{
                          padding: 12,
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "2px solid #10b981",
                          borderRadius: 8,
                          margin: "8px 0"
                        }}>
                          {q.answer}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {!isCorrect && q.correctIndex !== undefined && q.options && (
                  <div style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid #3b82f6",
                    borderRadius: 8,
                    padding: 12,
                    margin: "16px 0",
                    fontStyle: "italic"
                  }}>
                    <strong>Explanation:</strong> The correct answer is "{q.options[q.correctIndex]}".
                  </div>
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
                >
                  Next
                </button>
              ) : (
                <button 
                  style={styles.navButton} 
                  onClick={() => setShowReview(false)}
                >
                  Finish Review
                </button>
              )}
            </div>
          </div>
        );
      }
      
      if (completed) {
        // Show results after completion
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{item.title || "Quiz Results"}</span>
            </div>
            <div style={styles.resultsContainer}>
              <div style={styles.scoreContainer}>
                <div style={styles.scoreValue}>{score} / {totalQuestions}</div>
                <div style={styles.scorePercentage}>{totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</div>
              </div>
              {xpEarned > 0 && (
                <div style={styles.xpContainer}>
                  <Star size={20} color="#facc15" fill="#facc15" />
                  <span style={styles.xpText}>+{xpEarned} XP Earned!</span>
                </div>
              )}
              <div style={styles.actionButtons}>
                <button 
                  style={{ ...styles.actionButton, marginRight: 10 }} 
                  onClick={handleReview}
                >
                  <Eye size={16} style={{ marginRight: 8 }} />
                  Review Answers
                </button>
                <button 
                  style={{ ...styles.actionButton, background: "rgba(255,255,255,0.1)", color: "#e6edf6" }} 
                  onClick={handleRetake}
                >
                  <RotateCcw size={16} style={{ marginRight: 8 }} />
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (questions.length > 0) {
        const normalized = questions.map((q) => {
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
              <span style={styles.itemNumber}>{item.title || "Knowledge Check Quiz"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Test your knowledge with multiple-choice questions
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
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{item.title || "Knowledge Check Quiz"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Test your knowledge with multiple-choice questions
            </div>
            <div>No questions available</div>
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
    }

    if (type === "word_meanings") {
      // For Vocabulary Builder, show words one by one
      // Handle different possible data structures for vocabulary items
      let words = [];
      
      // Check various possible data structures
      if (item.data?.items) {
        words = item.data.items;
      } else if (item.data?.words) {
        words = item.data.words;
      } else if (item.words) {
        words = item.words;
      } else if (item.data) {
        // If data is an array directly
        words = Array.isArray(item.data) ? item.data : [];
      }
      
      // If no words, show completion button with proper description
      if (words.length === 0) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{item.title || "Vocabulary Builder"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Learn essential vocabulary and their translations
            </div>
            <div>No vocabulary items available</div>
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
      
      // Show words one by one
      if (completed) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{item.title || "Vocabulary Builder"}</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Learn essential vocabulary and their translations
            </div>
            <div style={styles.vocabCompleted}>
              <div style={styles.vocabCompletedIcon}>🎉</div>
              <h3 style={styles.vocabCompletedTitle}>Vocabulary Session Completed!</h3>
              <p style={styles.vocabCompletedText}>You've learned {words.length} new words</p>
            </div>
            <button 
              style={styles.actionButton} 
              onClick={handleRetake}
            >
              Review Vocabulary
            </button>
          </div>
        );
      }
      
      // Normalize word data structure
      const normalizedWords = words.map((word, index) => {
        // Handle different word object structures
        if (typeof word === 'string') {
          // If it's just a string, we can't display it properly without a meaning
          return { word, meaning: "Translation not available" };
        } else if (word.english && word.kumaoni) {
          return { word: word.english, meaning: word.kumaoni };
        } else if (word.word && word.meaning) {
          return { word: word.word, meaning: word.meaning };
        } else if (word.english_word && word.kumaoni_word) {
          return { word: word.english_word, meaning: word.kumaoni_word };
        } else if (Object.keys(word).length === 2) {
          // If object has exactly 2 keys, assume first is word, second is meaning
          const keys = Object.keys(word);
          return { word: word[keys[0]], meaning: word[keys[1]] };
        } else {
          // Fallback
          return { word: JSON.stringify(word), meaning: "Translation not available" };
        }
      });
      
      // Show current word
      const currentWord = normalizedWords[current] || normalizedWords[0];
      const progress = ((current + 1) / normalizedWords.length) * 100;
      
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>{item.title || "Vocabulary Builder"}</span>
          </div>
          <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
            Learn essential vocabulary and their translations
          </div>
          
          {/* Progress bar */}
          <div style={styles.stepHeader}>
            <span>Word {current + 1} of {normalizedWords.length}</span>
            <div style={styles.stepBarOuter}>
              <div style={{ ...styles.stepBarInner, width: `${progress}%` }} />
            </div>
          </div>
          
          {/* Word display */}
          <div style={styles.vocabWordContainer}>
            <div style={styles.vocabWord}>{currentWord.word}</div>
            <div style={styles.vocabMeaning}>{currentWord.meaning}</div>
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
            
            {current < normalizedWords.length - 1 ? (
              <button 
                style={styles.navButton} 
                onClick={() => setCurrent(Math.min(normalizedWords.length - 1, current + 1))}
              >
                Next Word
              </button>
            ) : (
              <button 
                style={styles.actionButton} 
                onClick={() => markDone()}
              >
                Complete Vocabulary Session
              </button>
            )}
          </div>
        </div>
      );
    }

    if (type === "sentence_making") {
      // Handle different possible data structures for sentence prompts
      let prompts = [];
      
      // Check various possible data structures
      if (item.data?.prompts) {
        prompts = item.data.prompts;
      } else if (item.data?.sentences) {
        prompts = item.data.sentences;
      } else if (item.prompts) {
        prompts = item.prompts;
      } else if (item.sentences) {
        prompts = item.sentences;
      } else if (item.data && Array.isArray(item.data)) {
        // If data is an array directly
        prompts = item.data;
      } else if (item.data) {
        // If it's a single prompt as a string
        prompts = [item.data];
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
              <span style={styles.itemNumber}>{item.title || "Sentence Construction"}</span>
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
              <span style={styles.itemNumber}>{item.title || "Sentence Construction"}</span>
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
            <span style={styles.itemNumber}>{item.title || "Sentence Construction"}</span>
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

    if (type === "daily_words") {
      // Handle daily vocabulary items
      let words = [];
      
      // Check various possible data structures
      if (item.data?.items) {
        words = item.data.items;
      } else if (item.data?.words) {
        words = item.data.words;
      } else if (item.items) {
        words = item.items;
      } else if (item.words) {
        words = item.words;
      } else if (item.data && Array.isArray(item.data)) {
        // If data is an array directly
        words = item.data;
      } else if (item.english_word && item.kumaoni_word) {
        // Single word object
        words = [item];
      } else if (item.data) {
        // If it's a single item as a string
        words = [item.data];
      }
      
      // Normalize words to ensure consistent structure
      const normalizedWords = words.map((word, index) => {
        if (typeof word === 'string') {
          return { english: word, kumaoni: "" };
        } else if (word.english && word.kumaoni) {
          return word;
        } else if (word.word && word.meaning) {
          return { english: word.word, kumaoni: word.meaning };
        } else if (word.english_word && word.kumaoni_word) {
          return { english: word.english_word, kumaoni: word.kumaoni_word };
        } else {
          // Fallback
          return { english: JSON.stringify(word), kumaoni: "" };
        }
      });
      
      // If no words, show completion button
      if (normalizedWords.length === 0) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>Daily Vocabulary</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Learn commonly used words daily
            </div>
            <div>No vocabulary words available</div>
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
      
      // Show words one by one (like vocabulary interface)
      if (completed) {
        return (
          <div style={styles.blockCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>Daily Vocabulary</span>
            </div>
            <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
              Learn commonly used words daily
            </div>
            <div style={styles.vocabCompleted}>
              <div style={styles.vocabCompletedIcon}>🎉</div>
              <h3 style={styles.vocabCompletedTitle}>Vocabulary Session Completed!</h3>
              <p style={styles.vocabCompletedText}>You've learned {normalizedWords.length} new words</p>
            </div>
            <button 
              style={styles.actionButton} 
              onClick={handleRetake}
            >
              Review Vocabulary
            </button>
          </div>
        );
      }
      
      // Show current word
      const currentWord = normalizedWords[current] || normalizedWords[0];
      const progress = ((current + 1) / normalizedWords.length) * 100;
      
      return (
        <div style={styles.blockCard}>
          <div style={styles.itemHeader}>
            <span style={styles.itemNumber}>Daily Vocabulary</span>
          </div>
          <div style={{ ...styles.moduleDescription, marginBottom: 20 }}>
            Learn commonly used words daily
          </div>
          
          {/* Progress bar */}
          <div style={styles.stepHeader}>
            <span>Word {current + 1} of {normalizedWords.length}</span>
            <div style={styles.stepBarOuter}>
              <div style={{ ...styles.stepBarInner, width: `${progress}%` }} />
            </div>
          </div>
          
          {/* Word display */}
          <div style={styles.vocabWordContainer}>
            <div style={styles.vocabWord}>{currentWord.english}</div>
            <div style={styles.vocabMeaning}>{currentWord.kumaoni}</div>
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
            
            {current < normalizedWords.length - 1 ? (
              <button 
                style={styles.navButton} 
                onClick={() => setCurrent(Math.min(normalizedWords.length - 1, current + 1))}
              >
                Next Word
              </button>
            ) : (
              <button 
                style={styles.actionButton} 
                onClick={() => markDone()}
              >
                Complete Session
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={styles.blockCard}>
        <div style={styles.itemHeader}>
          <span style={styles.itemNumber}>{item.title || "Learning Module"}</span>
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
          <ArrowLeft size={18} /> Back to Module
        </button>

        <div style={styles.header}>
          <div style={styles.lessonHeader}>
            <h1 style={styles.title}>
              {type === "quizzes" && "Knowledge Check Quiz"}
              {type === "word_meanings" && "Vocabulary Builder"}
              {type === "sentence_making" && "Sentence Construction"}
              {type === "daily_words" && "Daily Vocabulary"}
            </h1>
            {completed && <CheckCircle size={24} color="#10b981" />}
          </div>
          <p style={styles.subtitle}>
            {type === "quizzes" && "Test your knowledge with multiple-choice questions"}
            {type === "word_meanings" && "Learn essential vocabulary and their translations"}
            {type === "sentence_making" && "Practice constructing sentences in Kumauni"}
            {type === "daily_words" && "Learn commonly used words daily"}
          </p>
        </div>

        <div style={styles.content}>
          {renderModuleItemContent()}
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
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    fontStyle: "italic",
    color: "#a5b4fc",
    lineHeight: 1.5,
    marginTop: 10,
    marginBottom: 20,
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  vocabWordContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    margin: "20px 0",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  vocabWord: {
    fontSize: 36,
    fontWeight: 700,
    color: "#3b82f6",
    marginBottom: 20,
    textAlign: "center",
  },
  vocabMeaning: {
    fontSize: 24,
    color: "#e6edf6",
    opacity: 0.9,
    textAlign: "center",
  },
  vocabCompleted: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    textAlign: "center",
  },
  vocabCompletedIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  vocabCompletedTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 10px 0",
    color: "#10b981",
  },
  vocabCompletedText: {
    fontSize: 16,
    opacity: 0.8,
    margin: 0,
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
  correctOption: {
    border: "2px solid #10b981",
    background: "rgba(16, 185, 129, 0.1)",
  },
  incorrectOption: {
    border: "2px solid #ef4444",
    background: "rgba(239, 68, 68, 0.1)",
  },
  correctIndicator: {
    color: "#10b981",
    fontWeight: 600,
    marginLeft: "auto",
  },
  incorrectIndicator: {
    color: "#ef4444",
    fontWeight: 600,
    marginLeft: "auto",
  },
  moduleDescription: {
    fontSize: 16,
    opacity: 0.8,
    fontStyle: "italic",
    color: "#a5b4fc",
    lineHeight: 1.5,
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
  wordPair: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 24,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    marginBottom: 20,
  },
  word: {
    fontSize: 24,
    fontWeight: 700,
    color: "#3b82f6",
  },
  wordTranslation: {
    fontSize: 20,
    color: "#e6edf6",
    opacity: 0.8,
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
  resultsContainer: {
    textAlign: "center",
    padding: 20,
  },
  scoreContainer: {
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 700,
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 18,
    opacity: 0.8,
    color: "#e6edf6",
  },
  xpContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "rgba(250,204,21,0.2)",
    border: "1px solid rgba(250,204,21,0.3)",
    borderRadius: 12,
    padding: "12px 24px",
    marginBottom: 32,
  },
  xpText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#facc15",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
  },
  userAnswer: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    borderRadius: 8,
    padding: 12,
    margin: "8px 0",
  },
  correctAnswer: {
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid #10b981",
    borderRadius: 8,
    padding: 12,
    margin: "8px 0",
  },
  explanation: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid #3b82f6",
    borderRadius: 8,
    padding: 12,
    margin: "16px 0",
    fontStyle: "italic",
  },
};
