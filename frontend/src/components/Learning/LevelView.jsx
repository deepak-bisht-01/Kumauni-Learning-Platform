import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchLevelContent } from "../../services/api";

export default function LevelView() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

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
          setShouldRedirect(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [levelId, navigate]);

  // Redirect to modules page for this level
  useEffect(() => {
    if (shouldRedirect) {
      navigate(`/learning/${levelId}/modules`);
    }
  }, [shouldRedirect, levelId, navigate]);

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
        <div style={styles.loading}>Redirecting to modules...</div>
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