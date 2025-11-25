import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { fetchLevelModule, completeBlock } from "../../services/api";

export default function QuizView() {
  const { levelId, quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("Knowledge Check Quiz");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch the quiz data from the backend
    const fetchQuizData = async () => {
      try {
        // Fetch the specific quiz from the module
        const response = await fetchLevelModule(token, levelId, "quizzes");
        if (response.success && response.items) {
          // Find the specific quiz by ID
          const quizItem = response.items.find(item => 
            String(item.id) === String(quizId) || 
            String(item.id) === String(quizId)
          );
          
          if (quizItem) {
            setQuizTitle(quizItem.title || "Knowledge Check Quiz");
            
            // Extract questions from the quiz data
            let quizQuestions = [];
            
            // Try different possible sources of questions
            if (quizItem.data?.questions) {
              quizQuestions = quizItem.data.questions;
            } else if (quizItem.questions) {
              quizQuestions = quizItem.questions;
            } else if (quizItem.data) {
              quizQuestions = quizItem.data;
            }
            
            // Normalize questions to ensure consistent format
            const normalizedQuestions = quizQuestions.map((q, index) => {
              // Handle different question formats
              const question = q.question || q.q || q.prompt || `Question ${index + 1}`;
              const options = q.options || q.choices || q.answers || [];
              
              // Handle correct answer in different formats
              let correctAnswer = q.correct_answer;
              if (correctAnswer === undefined && q.answer !== undefined) {
                // If correct_answer is not provided but answer is, find the index
                correctAnswer = options.findIndex(opt => 
                  String(opt).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
                );
              }
              
              return {
                id: q.id || index,
                question,
                options,
                correct_answer: correctAnswer
              };
            });
            
            setQuestions(normalizedQuestions);
          } else {
            console.error("Quiz not found", { quizId, items: response.items });
          }
        } else {
          console.error("Failed to fetch quiz data:", response.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [levelId, quizId, navigate]);

  const handleAnswerSelect = (optionIndex) => {
    if (showResults) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleCompleteQuiz = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      // Submit quiz results to mark as completed
      const result = await completeBlock(token, quizId, score);
      if (result.success) {
        // Navigate back to the quizzes module
        navigate(`/learning/${levelId}/module/quizzes`);
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
      // Still navigate back even if there's an error
      navigate(`/learning/${levelId}/module/quizzes`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No Questions Available</h3>
            <p style={styles.emptyDescription}>This quiz doesn't have any questions yet.</p>
            <button 
              style={styles.backButton}
              onClick={() => navigate(`/learning/${levelId}/module/quizzes`)}
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isAnswered = selectedAnswer !== undefined;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(`/learning/${levelId}/module/quizzes`)}>
          <ArrowLeft size={18} /> Back to Quizzes
        </button>
        
        <div style={styles.quizHeader}>
          <h1 style={styles.title}>{quizTitle}</h1>
          <div style={styles.progress}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        {showResults ? (
          <div style={styles.resultsContainer}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>Quiz Complete!</h2>
              <div style={styles.score}>
                You scored {score} out of {questions.length}
              </div>
              <div style={styles.percentage}>
                {Math.round((score / questions.length) * 100)}%
              </div>
            </div>
            
            <div style={styles.reviewSection}>
              <h3 style={styles.reviewTitle}>Review Answers</h3>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div 
                    key={question.id} 
                    style={{
                      ...styles.reviewItem,
                      ...(isCorrect ? styles.correctAnswer : styles.wrongAnswer)
                    }}
                  >
                    <div style={styles.reviewQuestion}>
                      <strong>Q{index + 1}:</strong> {question.question}
                    </div>
                    <div style={styles.reviewAnswer}>
                      <span>Your answer: {question.options[userAnswer]}</span>
                      {!isCorrect && (
                        <span style={styles.correctLabel}>
                          Correct: {question.options[question.correct_answer]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.resultsActions}>
              <button style={styles.restartButton} onClick={handleRestartQuiz}>
                <RotateCcw size={18} /> Restart Quiz
              </button>
              <button style={styles.completeButton} onClick={handleCompleteQuiz}>
                Complete Quiz
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.quizContainer}>
            <div style={styles.questionCard}>
              <h2 style={styles.questionText}>{currentQuestion.question}</h2>
              
              <div style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  
                  return (
                    <button
                      key={index}
                      style={{
                        ...styles.optionButton,
                        ...(isSelected ? styles.selectedOption : {}),
                        ...(showResults && index === currentQuestion.correct_answer ? styles.correctOption : {})
                      }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResults}
                    >
                      <div style={styles.optionLetter}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div style={styles.optionText}>{option}</div>
                      {showResults && index === currentQuestion.correct_answer && (
                        <Check size={20} style={styles.checkIcon} />
                      )}
                      {showResults && isSelected && index !== currentQuestion.correct_answer && (
                        <X size={20} style={styles.xIcon} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div style={styles.navigation}>
              <button 
                style={styles.navButton}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              
              <button 
                style={{
                  ...styles.navButton,
                  ...styles.nextButton,
                  ...(isAnswered ? styles.enabledButton : {})
                }}
                onClick={handleNextQuestion}
                disabled={!isAnswered}
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
              </button>
            </div>
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
    maxWidth: 800, 
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
  quizHeader: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 800, 
    margin: "0 0 16px 0",
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  progress: {
    fontSize: 16,
    opacity: 0.8,
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
  quizContainer: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  questionCard: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 30,
    lineHeight: 1.5,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e6edf6",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  selectedOption: {
    border: "1px solid #8b5cf6",
    background: "rgba(139, 92, 246, 0.1)",
  },
  correctOption: {
    border: "1px solid #10b981",
    background: "rgba(16, 185, 129, 0.1)",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "rgba(139, 92, 246, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 500,
    flex: 1,
  },
  checkIcon: {
    color: "#10b981",
  },
  xIcon: {
    color: "#f87171",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
  },
  navButton: {
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e6edf6",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    flex: 1,
  },
  nextButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  enabledButton: {
    opacity: 1,
    background: "linear-gradient(90deg, #8b5cf6 0%, #22d3ee 100%)",
    cursor: "pointer",
  },
  resultsContainer: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  resultsHeader: {
    textAlign: "center",
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 800,
    margin: "0 0 16px 0",
  },
  score: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 36,
    fontWeight: 800,
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  reviewSection: {
    marginBottom: 30,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
  reviewItem: {
    padding: "16px 20px",
    borderRadius: 12,
    marginBottom: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  correctAnswer: {
    border: "1px solid #10b981",
    background: "rgba(16, 185, 129, 0.1)",
  },
  wrongAnswer: {
    border: "1px solid #f87171",
    background: "rgba(248, 113, 113, 0.1)",
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  reviewAnswer: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    opacity: 0.9,
  },
  correctLabel: {
    color: "#10b981",
    fontWeight: 600,
  },
  resultsActions: {
    display: "flex",
    gap: 16,
  },
  restartButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e6edf6",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    flex: 1,
  },
  completeButton: {
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #8b5cf6 0%, #22d3ee 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    flex: 1,
  },
};