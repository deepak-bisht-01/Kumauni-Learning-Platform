import React, { useState, useEffect } from "react";
import { X, Eye, CheckCircle, Star, RotateCcw, ChevronLeft, ChevronRight, ArrowRight, Trophy, Lightbulb } from "lucide-react";
import { fetchDailyQuiz, submitDailyQuiz } from "../../services/api";

// Add a custom event for dashboard refresh
// Using a more robust approach for creating custom events
const refreshDashboardEvent = new CustomEvent('refreshDashboard');

export default function DailyQuiz({ isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadDailyQuiz();
    } else {
      // Reset when closed
      setQuestions([]);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
      setXpEarned(0);
      setShowReview(false);
      setReviewIndex(0);
    }
  }, [isOpen]);

  const loadDailyQuiz = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const data = await fetchDailyQuiz(token);
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        console.error("Failed to load quiz:", data.message);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const result = await submitDailyQuiz(token, {
        answers: selectedAnswers,
        questionIds: questions.map((q) => q.id),
      });

      if (result.success) {
        setScore(result.score || 0);
        setXpEarned(result.xpEarned || 0);
        setShowResults(true);
        
        // Dispatch event to refresh dashboard
        console.log('Dispatching refreshDashboard event from DailyQuiz');
        window.dispatchEvent(refreshDashboardEvent);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = () => {
    setShowReview(true);
    setReviewIndex(0);
  };

  const handleFinishReview = () => {
    setShowReview(false);
    setReviewIndex(0);
  };

  const handleReviewNext = () => {
    if (reviewIndex < questions.length - 1) {
      setReviewIndex(reviewIndex + 1);
    }
  };

  const handleReviewPrevious = () => {
    if (reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  // Review mode
  if (showReview && questions.length > 0) {
    const reviewQ = questions[reviewIndex];
    const userAnswer = selectedAnswers[reviewQ.id];
    const isCorrect = userAnswer === reviewQ.correct_answer;
    const reviewProgress = ((reviewIndex + 1) / questions.length) * 100;

    return (
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconContainer}>
                <Eye size={24} color="#3b82f6" />
              </div>
              <div>
                <h2 style={styles.title}>Quiz Review</h2>
                <p style={styles.subtitle}>Review your answers and explanations</p>
              </div>
            </div>
            <button style={styles.closeButton} onClick={handleClose}>
              <X size={24} color="#e6edf6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${reviewProgress}%` }} />
            </div>
            <div style={styles.progressText}>
              Question {reviewIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Question */}
          <div style={styles.questionContainer}>
            <div style={styles.questionNumber}>Question {reviewIndex + 1}</div>
            <h3 style={styles.questionText}>{reviewQ.question}</h3>
            {reviewQ.module && (
              <div style={styles.moduleBadge}>From: {reviewQ.module}</div>
            )}

            {/* Options with review indicators */}
            <div style={styles.optionsContainer}>
              {reviewQ.options.map((option, index) => {
                let optionStyle = { ...styles.optionButton };
                let indicator = null;
                
                if (index === reviewQ.correct_answer) {
                  // Correct answer - green
                  optionStyle = { 
                    ...styles.optionButton,
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "2px solid #10b981"
                  };
                  indicator = <CheckCircle size={16} color="#10b981" />;
                } else if (index === userAnswer) {
                  // User's answer
                  if (!isCorrect) {
                    // Wrong answer - red
                    optionStyle = { 
                      ...styles.optionButton,
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "2px solid #ef4444"
                    };
                  } else {
                    // Correct user answer - green
                    optionStyle = { 
                      ...styles.optionButton,
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "2px solid #10b981"
                    };
                  }
                }
                
                return (
                  <button
                    key={index}
                    style={optionStyle}
                    disabled
                  >
                    <div style={styles.optionContent}>
                      <div
                        style={{
                          ...styles.optionCircle,
                        }}
                      >
                        {indicator}
                      </div>
                      <span style={styles.optionText}>{option}</span>
                      {index === reviewQ.correct_answer && (
                        <span style={{ 
                          marginLeft: "auto", 
                          fontWeight: "bold",
                          color: "#10b981"
                        }}>
                          ✓ Correct
                        </span>
                      )}
                      {index === userAnswer && !isCorrect && (
                        <span style={{ 
                          marginLeft: "auto", 
                          fontWeight: "bold",
                          color: "#ef4444"
                        }}>
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!isCorrect && (
              <div style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid #3b82f6",
                borderRadius: 8,
                padding: 12,
                margin: "16px 0",
                fontStyle: "italic"
              }}>
                <strong>Explanation:</strong> The correct answer is "{reviewQ.options[reviewQ.correct_answer]}".
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={styles.navigationContainer}>
            <button
              style={{
                ...styles.navButton,
                ...(reviewIndex === 0 ? styles.navButtonDisabled : {}),
              }}
              onClick={handleReviewPrevious}
              disabled={reviewIndex === 0}
            >
              Previous
            </button>
            {reviewIndex === questions.length - 1 ? (
              <button
                style={styles.navButton}
                onClick={handleFinishReview}
              >
                Finish Review
              </button>
            ) : (
              <button
                style={styles.navButton}
                onClick={handleReviewNext}
              >
                Next <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results view with XP distribution
  if (showResults && questions.length > 0) {
    return (
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconContainer}>
                {score >= questions.length * 0.7 ? (
                  <Trophy size={24} color="#facc15" fill="#facc15" />
                ) : (
                  <Star size={24} color="#3b82f6" />
                )}
              </div>
              <div>
                <h2 style={styles.title}>Quiz Results</h2>
                <p style={styles.subtitle}>See how you did</p>
              </div>
            </div>
            <button style={styles.closeButton} onClick={handleClose}>
              <X size={24} color="#e6edf6" />
            </button>
          </div>

          <div style={styles.resultsContainer}>
            <div style={styles.resultsIcon(score >= questions.length * 0.7)}>
              {score >= questions.length * 0.7 ? (
                <Trophy size={64} color="#facc15" fill="#facc15" />
              ) : (
                <Star size={64} color="#3b82f6" />
              )}
            </div>
            <h2 style={styles.resultsTitle}>
              {score >= questions.length * 0.7 ? "Great Job! 🎉" : "Good Try! 💪"}
            </h2>
            <div style={styles.scoreContainer}>
              <div style={styles.scoreValue}>
                {score} / {questions.length}
              </div>
              <div style={styles.scorePercentage}>
                {Math.round((score / questions.length) * 100)}% Correct
              </div>
            </div>
            {xpEarned > 0 && (
              <div style={styles.xpContainer}>
                <Star size={20} color="#facc15" fill="#facc15" />
                <span style={styles.xpText}>+{xpEarned} XP Earned!</span>
              </div>
            )}
            <div style={styles.actionButtons}>
              <button style={{ ...styles.navButton, marginRight: 10 }} onClick={handleReview}>
                <Eye size={16} style={{ marginRight: 8 }} />
                Review Answers
              </button>
              <button 
                style={{ ...styles.navButton, background: "rgba(255,255,255,0.1)", color: "#e6edf6" }} 
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz questions
  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <Lightbulb size={24} color="#3b82f6" />
            </div>
            <div>
              <h2 style={styles.title}>Daily Quiz</h2>
              <p style={styles.subtitle}>Test your knowledge from random modules</p>
            </div>
          </div>
          <button style={styles.closeButton} onClick={handleClose}>
            <X size={24} color="#e6edf6" />
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loading}>Loading quiz questions...</div>
          </div>
        ) : questions.length > 0 ? (
          <>
            {/* Progress Bar */}
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.progressText}>
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>

            {/* Question */}
            <div style={styles.questionContainer}>
              <div style={styles.questionNumber}>Question {currentQuestion + 1}</div>
              <h3 style={styles.questionText}>{currentQ.question}</h3>
              {currentQ.module && (
                <div style={styles.moduleBadge}>From: {currentQ.module}</div>
              )}

              {/* Options */}
              <div style={styles.optionsContainer}>
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQ.id] === index;
                  return (
                    <button
                      key={index}
                      style={{
                        ...styles.optionButton,
                        ...(isSelected ? styles.optionButtonSelected : {}),
                      }}
                      onClick={() => handleAnswerSelect(currentQ.id, index)}
                    >
                      <div style={styles.optionContent}>
                        <div
                          style={{
                            ...styles.optionCircle,
                            ...(isSelected ? styles.optionCircleSelected : {}),
                          }}
                        >
                          {isSelected && <div style={styles.optionCircleInner} />}
                        </div>
                        <span style={styles.optionText}>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={styles.navigationContainer}>
              <button
                style={{
                  ...styles.navButton,
                  ...(currentQuestion === 0 ? styles.navButtonDisabled : {}),
                }}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  style={{
                    ...styles.submitButton,
                    ...(!allAnswered ? styles.submitButtonDisabled : {}),
                  }}
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              ) : (
                <button
                  style={styles.navButton}
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                >
                  Next <ArrowRight size={18} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>No quiz questions available at the moment.</p>
            <button style={styles.closeResultsButton} onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
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
    padding: 20,
  },
  modal: {
    background: "linear-gradient(180deg, #0b1220 0%, #151129 100%)",
    borderRadius: 24,
    width: "100%",
    maxWidth: 700,
    maxHeight: "90vh",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(59,130,246,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(59,130,246,0.3)",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: "#e6edf6",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    margin: "4px 0 0 0",
    color: "#e6edf6",
  },
  closeButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  progressContainer: {
    padding: "20px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  progressBar: {
    width: "100%",
    height: 6,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    color: "#e6edf6",
  },
  questionContainer: {
    flex: 1,
    padding: "28px",
    overflowY: "auto",
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: 600,
    color: "#3b82f6",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  questionText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#e6edf6",
    margin: "0 0 16px 0",
    lineHeight: 1.5,
  },
  moduleBadge: {
    display: "inline-block",
    background: "rgba(59,130,246,0.2)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    color: "#60a5fa",
    marginBottom: 24,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  optionButton: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "16px 20px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },
  optionButtonSelected: {
    background: "rgba(59,130,246,0.2)",
    border: "1px solid rgba(59,130,246,0.5)",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
  correctOption: {
    border: "2px solid #10b981",
    background: "rgba(16, 185, 129, 0.1)",
  },
  incorrectOption: {
    border: "2px solid #ef4444",
    background: "rgba(239, 68, 68, 0.1)",
  },
  optionContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  optionCircleSelected: {
    border: "2px solid #3b82f6",
    background: "#3b82f6",
  },
  optionCircleCorrect: {
    border: "2px solid #10b981",
    background: "#10b981",
  },
  optionCircleIncorrect: {
    border: "2px solid #ef4444",
    background: "#ef4444",
  },
  optionCircleInner: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#fff",
  },
  optionText: {
    fontSize: 16,
    color: "#e6edf6",
    flex: 1,
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
  navigationContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 28px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
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
  navButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  submitButton: {
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 12,
    padding: "12px 32px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
    transition: "all 0.2s",
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  loadingContainer: {
    padding: "60px 28px",
    textAlign: "center",
  },
  loading: {
    fontSize: 16,
    color: "#e6edf6",
    opacity: 0.7,
  },
  resultsContainer: {
    padding: "28px",
    overflowY: "auto",
    textAlign: "center",
  },
  resultsIcon: (isGood) => ({
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: isGood
      ? "linear-gradient(135deg, rgba(250,204,21,0.2) 0%, rgba(245,158,11,0.2) 100%)"
      : "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    border: `1px solid ${isGood ? "rgba(250,204,21,0.3)" : "rgba(59,130,246,0.3)"}`,
  }),
  resultsTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: "#e6edf6",
    margin: "0 0 24px 0",
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
  errorContainer: {
    padding: "60px 28px",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#e6edf6",
    opacity: 0.7,
    marginBottom: 24,
  },
  closeResultsButton: {
    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 12,
    padding: "14px 32px",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
    transition: "all 0.2s",
    width: "100%",
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