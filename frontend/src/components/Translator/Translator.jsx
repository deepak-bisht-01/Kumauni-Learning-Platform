// frontend/src/components/Translator/Translator.jsx
import React, { useState, useRef } from "react";

export default function Translator() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const API_URL = process.env.REACT_APP_TRANSLATOR_URL || "http://127.0.0.1:5001";

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setTranslated("");
    setAudioUrl(null);

    try {
      const res = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setTranslated(data.translated || data.error || "Translation unavailable");
    } catch (e) {
      setTranslated("⚠️ Translator server not running");
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!translated || loading) return;
    
    try {
      const res = await fetch(`${API_URL}/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translated }),
      });
      
      const data = await res.json();
      if (data.audio) {
        setAudioUrl(data.audio);
        // Play the audio automatically
        setTimeout(() => {
          playAudio();
        }, 100);
      }
    } catch (e) {
      console.error("TTS Error:", e);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    
    audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🌐 Kumaoni Translator</h1>
        <p style={styles.subtitle}>Translate between English and Kumaoni</p>

        <textarea
          style={styles.textarea}
          placeholder="Enter English text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        <div style={styles.resultBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Result:</strong>
            {translated && (
              <button
                style={styles.speakerButton}
                onClick={isPlaying ? stopAudio : handleTextToSpeech}
                disabled={loading}
              >
                {isPlaying ? "⏹️ Stop" : "🔊 Listen"}
              </button>
            )}
          </div>
          <p style={styles.resultText}>
            {translated || "Your translation will appear here."}
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => window.location.assign("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(180deg, #0b1220 0%, #0a0f1c 40%, #151129 100%)",
    fontFamily: "Inter, sans-serif",
    color: "#e6edf6",
    padding: 20,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: "40px 50px",
    maxWidth: 600,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#67e8f9",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 24,
  },
  textarea: {
    width: "100%",
    height: 120,
    background: "#0b1220",
    color: "#e6edf6",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 12,
    resize: "none",
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
    border: "none",
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 16,
    color: "#081018",
    marginBottom: 20,
    boxShadow: "0 8px 24px rgba(34,211,238,0.3)",
  },
  speakerButton: {
    background: "transparent",
    border: "1px solid rgba(103,232,249,0.5)",
    borderRadius: 6,
    padding: "4px 8px",
    color: "#67e8f9",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  resultBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 16,
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  resultText: {
    marginTop: 6,
    fontSize: 16,
    color: "#cbd5e1",
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#67e8f9",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
  },
};