import React, { useState, useRef } from "react";
import { Mic, MicOff, Play, RotateCcw, Upload, FileAudio, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccentAnalyzer() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("record"); // "record" or "upload"
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioBlobRef = useRef(null); // Store the audio blob instead of base64 in localStorage

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = audioBlob; // Store the blob directly
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setError(null);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to access microphone. Please check permissions and ensure you're using a secure connection (HTTPS).");
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      setError("Please upload an audio file (MP3, WAV, etc.)");
      return;
    }

    // Store the file directly instead of converting to base64
    audioBlobRef.current = file;
    
    // Create object URL for playback
    const audioUrl = URL.createObjectURL(file);
    setAudioUrl(audioUrl);
    setError(null);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Analyze the recorded audio
  const analyzeAccent = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      if (!audioBlobRef.current) {
        throw new Error("No audio recorded yet. Please record some audio first.");
      }

      // Convert blob to base64 for sending to backend
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlobRef.current);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const response = await fetch("http://localhost:5001/analyze-accent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64data }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to analyze accent");
      }

      setAnalysisResult(data);
    } catch (err) {
      console.error("Error analyzing accent:", err);
      setError(
        err.message || 
        "Failed to analyze accent. The accent analyzer model may not be available. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Play the recorded audio
  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  };

  // Reset everything
  const reset = () => {
    setAudioUrl(null);
    setAnalysisResult(null);
    setError(null);
    audioBlobRef.current = null; // Clear the blob reference
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get the best matching accent from the analysis results
  const getBestAccent = () => {
    if (!analysisResult?.analysis) return null;
    
    // Sort by score and get the highest
    const sorted = [...analysisResult.analysis].sort((a, b) => b.score - a.score);
    return sorted[0];
  };

  // Get feedback based on the accent score
  const getFeedback = () => {
    const bestAccent = getBestAccent();
    if (!bestAccent) return "No accent data available.";
    
    if (bestAccent.score > 0.8) {
      return `Great job! Your accent is very close to a native ${bestAccent.label} speaker.`;
    } else if (bestAccent.score > 0.6) {
      return `Good effort! With a bit more practice, your ${bestAccent.label} accent will improve significantly.`;
    } else if (bestAccent.score > 0.4) {
      return `Fair attempt. Focus on the pronunciation patterns of ${bestAccent.label}.`;
    } else {
      return `Keep practicing! Focus on the vowel sounds and rhythm of ${bestAccent.label}.`;
    }
  };

  // Get quality description based on score
  const getQualityDescription = () => {
    const bestAccent = getBestAccent();
    if (!bestAccent) return "Unknown";
    
    if (bestAccent.score > 0.8) return "Excellent";
    if (bestAccent.score > 0.6) return "Good";
    if (bestAccent.score > 0.4) return "Fair";
    return "Needs Practice";
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h1 style={styles.title}>Kumaoni Accent Analyzer</h1>
          <p style={styles.subtitle}>Record yourself speaking Kumaoni and get feedback on your pronunciation</p>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {/* Recording Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Record or Upload Your Voice</h2>
            
            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "record" ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab("record")}
              >
                <Mic size={16} />
                Record
              </button>
              <button
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "upload" ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab("upload")}
              >
                <FileAudio size={16} />
                Upload File
              </button>
            </div>
            
            {/* Tab Content */}
            {activeTab === "record" ? (
              <div style={styles.recordingCard}>
                <div style={styles.micContainer}>
                  <div 
                    style={{
                      ...styles.micButton,
                      ...(isRecording ? styles.micButtonRecording : {})
                    }}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                  </div>
                </div>
                
                <div style={styles.recordingStatus}>
                  {isRecording ? (
                    <div style={styles.recordingIndicator}>
                      <div style={styles.recordingDot}></div>
                      <span>Recording...</span>
                    </div>
                  ) : audioUrl ? (
                    <span>Recording saved. Ready to analyze.</span>
                  ) : (
                    <span>Click the microphone to start recording</span>
                  )}
                </div>
                
                {audioUrl && (
                  <div style={styles.audioControls}>
                    <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
                    <button style={styles.audioButton} onClick={playAudio}>
                      <Play size={20} />
                      Play Recording
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.uploadCard}>
                <div style={styles.uploadArea}>
                  <FileAudio size={48} color="#8b5cf6" />
                  <p style={styles.uploadText}>Upload an audio file to analyze your Kumaoni accent</p>
                  <p style={styles.uploadHint}>Supported formats: MP3, WAV, OGG, M4A</p>
                  <button 
                    style={styles.uploadButton}
                    onClick={triggerFileInput}
                  >
                    <Upload size={16} />
                    Choose Audio File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="audio/*"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {audioUrl && (
                  <div style={styles.audioControls}>
                    <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
                    <button style={styles.audioButton} onClick={playAudio}>
                      <Play size={20} />
                      Play Uploaded Audio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {audioUrl && (
            <div style={styles.actions}>
              <button 
                style={{ ...styles.actionButton, ...styles.analyzeButton }}
                onClick={analyzeAccent}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Analyze My Accent"}
              </button>
              <button 
                style={{ ...styles.actionButton, ...styles.resetButton }}
                onClick={reset}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={styles.error}>
              <div style={styles.errorContent}>
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Analysis Results</h2>
              <div style={styles.resultsCard}>
                <div style={styles.resultHeader}>
                  <h3>Your Pronunciation Analysis</h3>
                  {getBestAccent() && (
                    <div style={styles.confidenceScore}>
                      Confidence: {Math.round(getBestAccent().score * 100)}%
                    </div>
                  )}
                </div>
                
                {analysisResult.analysis && (
                  <div style={styles.resultDetails}>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Detected Accent:</span>
                      <span style={styles.resultValue}>
                        {getBestAccent()?.label || "Unknown"}
                      </span>
                    </div>
                    
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Pronunciation Quality:</span>
                      <span style={styles.resultValue}>
                        {getQualityDescription()}
                      </span>
                    </div>
                    
                    <div style={styles.feedback}>
                      <h4>Feedback:</h4>
                      <p>{getFeedback()}</p>
                    </div>
                  </div>
                )}
                
                {analysisResult.message && (
                  <div style={styles.message}>
                    <p>{analysisResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>How to Use</h2>
            <div style={styles.instructions}>
              <ol>
                <li>Choose between recording directly or uploading an audio file</li>
                <li>If recording, click the microphone button to start recording</li>
                <li>Say a few sentences in Kumaoni</li>
                <li>If uploading, select an audio file from your device</li>
                <li>Click "Analyze My Accent" to get feedback</li>
              </ol>
            </div>
          </div>
          
          {/* Model Status Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>System Status</h2>
            <div style={styles.statusInfo}>
              <p>The accent analyzer uses a custom-trained TensorFlow model for Kumaoni accent detection.</p>
              <p>If you continue to experience issues, please try again in a few minutes.</p>
            </div>
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
    padding: "20px",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "10px 20px",
    color: "#e6edf6",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    margin: "0 0 12px 0",
    background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    margin: 0,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  section: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 20px 0",
    color: "#e6edf6",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  tabContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  tabButton: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 20px",
    color: "#e6edf6",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
  },
  activeTab: {
    background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
    border: "1px solid rgba(139,92,246,0.5)",
    color: "#fff",
  },
  recordingCard: {
    textAlign: "center",
  },
  uploadCard: {
    textAlign: "center",
  },
  uploadArea: {
    padding: "40px 20px",
    border: "2px dashed rgba(139,92,246,0.3)",
    borderRadius: 16,
    backgroundColor: "rgba(139,92,246,0.05)",
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 600,
    margin: "20px 0 10px 0",
  },
  uploadHint: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  uploadButton: {
    background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 auto",
    boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
  },
  micContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(167,139,250,0.1) 100%)",
    border: "2px solid rgba(139,92,246,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  micButtonRecording: {
    background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(248,113,113,0.1) 100%)",
    border: "2px solid rgba(239,68,68,0.3)",
    animation: "pulse 1.5s infinite",
  },
  recordingStatus: {
    fontSize: 16,
    marginBottom: 20,
  },
  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#ef4444",
    animation: "pulse 1.5s infinite",
  },
  audioControls: {
    display: "flex",
    justifyContent: "center",
  },
  audioButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "12px 24px",
    color: "#e6edf6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: 15,
    justifyContent: "center",
  },
  actionButton: {
    border: "none",
    borderRadius: 12,
    padding: "14px 28px",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  analyzeButton: {
    background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
  },
  resetButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#e6edf6",
  },
  error: {
    background: "rgba(239,68,68,0.2)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 20,
    color: "#f87171",
  },
  errorContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  resultsCard: {
    background: "rgba(139,92,246,0.1)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(139,92,246,0.2)",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  confidenceScore: {
    background: "rgba(16,185,129,0.2)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#10b981",
  },
  resultDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  resultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  resultLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 600,
    color: "#e6edf6",
  },
  feedback: {
    marginTop: 16,
    padding: 16,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  message: {
    marginTop: 16,
    padding: 16,
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  statusInfo: {
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  instructions: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
  },
};