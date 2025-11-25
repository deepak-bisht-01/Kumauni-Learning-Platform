import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, Sparkles } from "lucide-react";

export default function SelectMode() {
  const navigate = useNavigate();
  const modes = [
    { id: "beginner", label: "Beginner" },
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Medium" },
    { id: "hard", label: "Hard" },
    { id: "expert", label: "Expert" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}><Target size={28} color="#8b5cf6" /></div>
            <div>
              <div style={styles.kicker}>START LEARNING</div>
              <h1 style={styles.title}>Choose Your Mode</h1>
              <div style={styles.subtitle}>Pick a difficulty and continue your Kumaoni journey</div>
            </div>
            <div style={styles.spark}><Sparkles size={28} color="#22d3ee" /></div>
          </div>

          <div style={styles.grid}>
            {modes.map((m) => (
              <button
                key={m.id}
                style={styles.modeButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(139,92,246,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,92,246,0.2)";
                }}
                onClick={() => navigate(`/learning/${m.id}`)}
              >
                {m.label}
              </button>
            ))}
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
  card: {
    background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)",
    borderRadius: 24,
    padding: 28,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(139,92,246,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(139,92,246,0.3)",
  },
  spark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(34,211,238,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(34,211,238,0.3)",
  },
  kicker: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: 600,
    letterSpacing: "1px",
    marginBottom: 8,
  },
  title: { fontSize: 30, fontWeight: 800, margin: 0 },
  subtitle: { opacity: 0.75, marginTop: 8 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 16 },
  modeButton: {
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: 12,
    padding: "16px",
    color: "#081018",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 8px 24px rgba(139,92,246,0.2)",
  },
};