import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, FileText, Book, Edit3, Target } from "lucide-react";

export default function ModuleOptions() {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const modules = [
    { id: "quizzes", label: "Quizzes" },
    { id: "word_meanings", label: "Word Meanings" },
    { id: "sentence_making", label: "Sentence Making" },
    { id: "daily_words", label: "Daily Using Words" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(`/learning/${levelId}`)}>
          <ArrowLeft size={18} /> Back to Level
        </button>
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.headerIcon}><Target size={24} color="#8b5cf6" /></div>
            <h1 style={styles.title}>Choose a Module</h1>
          </div>
          <div style={styles.grid}>
            {modules.map((m) => {
              const icon = m.id === "quizzes" ? <ClipboardList size={24} />
                : m.id === "word_meanings" ? <Book size={24} />
                : m.id === "sentence_making" ? <Edit3 size={24} />
                : <FileText size={24} />;
              return (
                <button
                  key={m.id}
                  style={styles.moduleButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(34,211,238,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,211,238,0.2)";
                  }}
                  onClick={() => navigate(`/learning/${levelId}/module/${m.id}`)}
                >
                  <span style={styles.moduleIcon}>{icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
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
  container: { maxWidth: 900, margin: "0 auto" },
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
  },
  card: {
    background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)",
    borderRadius: 24,
    padding: 28,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  headerRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(139,92,246,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(139,92,246,0.3)",
  },
  title: { fontSize: 30, fontWeight: 800, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  moduleButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 16,
    padding: "18px",
    color: "#081018",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 8px 24px rgba(34,211,238,0.2)",
  },
  moduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};