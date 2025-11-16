import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, FileText, ClipboardList, ArrowLeft, CheckCircle } from "lucide-react";
import { fetchLevelContent } from "../../services/api";

export default function LevelView() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchLevelContent(token, levelId)
      .then((data) => {
        if (data.success) {
          setContent(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [levelId, navigate]);

  const handleLessonClick = (lessonId) => {
    navigate(`/learning/${levelId}/${lessonId}`);
  };

  const handleQuizClick = (quizId) => {
    navigate(`/learning/${levelId}/quiz/${quizId}`);
  };

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/learning/${levelId}/assignment/${assignmentId}`);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Level not found</div>
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
          <h1 style={styles.title}>{content.levelName}</h1>
          <p style={styles.subtitle}>{content.description}</p>
        </div>

        {/* Lessons Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Play size={20} style={{ marginRight: 8 }} />
            Lessons
          </h2>
          <div style={styles.itemsGrid}>
            {content.lessons?.map((lesson, index) => (
              <div
                key={lesson.id}
                style={styles.itemCard}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div style={styles.itemHeader}>
                  <span style={styles.itemNumber}>Lesson {index + 1}</span>
                  {lesson.completed && <CheckCircle size={18} color="#10b981" />}
                </div>
                <h3 style={styles.itemTitle}>{lesson.title}</h3>
                <p style={styles.itemDescription}>{lesson.description}</p>
                <div style={styles.itemMeta}>
                  <span>{lesson.type === "video" ? "🎥" : lesson.type === "audio" ? "🎵" : "📄"}</span>
                  <span>{lesson.duration || "5 min"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes Section */}
        {content.quizzes && content.quizzes.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <ClipboardList size={20} style={{ marginRight: 8 }} />
              Quizzes
            </h2>
            <div style={styles.itemsGrid}>
              {content.quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  style={styles.itemCard}
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <div style={styles.itemHeader}>
                    <span style={styles.itemNumber}>Quiz {index + 1}</span>
                    {quiz.completed && <CheckCircle size={18} color="#10b981" />}
                  </div>
                  <h3 style={styles.itemTitle}>{quiz.title}</h3>
                  <p style={styles.itemDescription}>{quiz.description}</p>
                  <div style={styles.itemMeta}>
                    <span>{quiz.questionsCount} Questions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Section */}
        {content.assignments && content.assignments.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <FileText size={20} style={{ marginRight: 8 }} />
              Assignments
            </h2>
            <div style={styles.itemsGrid}>
              {content.assignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  style={styles.itemCard}
                  onClick={() => handleAssignmentClick(assignment.id)}
                >
                  <div style={styles.itemHeader}>
                    <span style={styles.itemNumber}>Assignment {index + 1}</span>
                    {assignment.completed && <CheckCircle size={18} color="#10b981" />}
                  </div>
                  <h3 style={styles.itemTitle}>{assignment.title}</h3>
                  <p style={styles.itemDescription}>{assignment.description}</p>
                </div>
              ))}
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
    maxWidth: 1000,
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
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
  },
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  itemCard: {
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
    fontSize: 12,
    opacity: 0.6,
    fontWeight: 600,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 1.5,
  },
  itemMeta: {
    fontSize: 12,
    opacity: 0.6,
    display: "flex",
    gap: 12,
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
