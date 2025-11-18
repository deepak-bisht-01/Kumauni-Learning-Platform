import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchLevelModule } from "../../services/api";

export default function ModuleView() {
  const { levelId, type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchLevelModule(token, levelId, type).then((data) => {
      if (data.success) setItems(data.items || []);
      setLoading(false);
    });
  }, [levelId, type, navigate]);

  const titleMap = {
    quizzes: "Quizzes",
    word_meanings: "Word Meanings",
    sentence_making: "Sentence Making",
    daily_words: "Daily Using Words",
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(`/learning/${levelId}/modules`)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={styles.title}>{titleMap[type] || "Module"}</h1>
        {loading ? (
          <div style={styles.loading}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={styles.empty}>No content available</div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardTitle}>{item.title || item.english_word || "Item"}</div>
                {type === "quizzes" && (
                  <div style={styles.cardMeta}>{item.questions_count} Questions</div>
                )}
                {type === "word_meanings" && item.data?.items && (
                  <div style={styles.list}>
                    {item.data.items.slice(0, 5).map((w, i) => (
                      <div key={i} style={styles.listItem}>
                        <span>{w.word}</span>
                        <span style={styles.muted}>{w.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
                {type === "sentence_making" && item.data?.prompts && (
                  <div style={styles.list}>
                    {item.data.prompts.slice(0, 3).map((p, i) => (
                      <div key={i} style={styles.listItem}>{p}</div>
                    ))}
                  </div>
                )}
                {type === "daily_words" && (
                  <div style={styles.list}>
                    <div style={styles.listItem}>
                      <span>{item.english_word}</span>
                      <span style={styles.muted}>{item.kumaoni_word}</span>
                    </div>
                  </div>
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
  container: { maxWidth: 1000, margin: "0 auto" },
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
  title: { fontSize: 28, fontWeight: 700, marginBottom: 20 },
  loading: { opacity: 0.7 },
  empty: { opacity: 0.7 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
  },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  cardMeta: { fontSize: 12, opacity: 0.7 },
  list: { display: "grid", gap: 8 },
  listItem: { display: "flex", justifyContent: "space-between" },
  muted: { opacity: 0.7 },
};