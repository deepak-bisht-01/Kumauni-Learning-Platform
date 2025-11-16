import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Clock,
  Heart,
  Filter,
  TrendingUp,
  ArrowRight,
  Play,
} from "lucide-react";
import { fetchStories, toggleStoryFavorite } from "../../services/api";

const CATEGORIES = ["All", "Fables", "Folklore", "Myths", "History", "Culture"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Stories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchStories(token, {
      category: selectedCategory !== "All" ? selectedCategory.toLowerCase() : null,
      level: selectedLevel !== "All" ? selectedLevel.toLowerCase() : null,
      search: search || null,
    })
      .then((data) => {
        console.log("📥 Full API response:", data);
        console.log("📥 Response keys:", Object.keys(data));
        console.log("📥 data.popular:", data.popular);
        console.log("📥 data.popular type:", typeof data.popular);
        console.log("📥 data.popular length:", data.popular?.length);
        if (data.success) {
          setStories(data.stories || []);
          const popularStories = data.popular || [];
          console.log("⭐ Popular stories before setState:", popularStories);
          setPopular(popularStories);
          // Debug: Log famous stories
          console.log("⭐ Famous stories received:", popularStories);
          console.log("⭐ Famous stories count:", popularStories.length);
          if (popularStories.length === 0) {
            console.log("⚠️ No famous stories found. Mark stories as is_famous = true in Supabase.");
            console.log("⚠️ Check backend logs for famous stories query results.");
            console.log("⚠️ Full response object:", JSON.stringify(data, null, 2));
          } else {
            console.log("✅ Famous stories will be displayed in carousel!");
            popularStories.forEach((story, idx) => {
              console.log(`  ${idx + 1}. ID: ${story.id}, Title: ${story.title}, Image: ${story.image || 'missing'}`);
            });
          }
        } else {
          console.error("❌ API returned success: false", data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stories:", error);
        setLoading(false);
      });
  }, [search, selectedCategory, selectedLevel, navigate]);

  // Manual navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + popular.length) % popular.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % popular.length);
  };

  const handleStoryClick = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  const handleFavorite = async (e, storyId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    const result = await toggleStoryFavorite(token, storyId);
    if (result.success) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId ? { ...s, isFavorite: result.isFavorite } : s
        )
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading stories...</div>
      </div>
    );
  }

  return (
    <>
      {/* Style for dropdown options */}
      <style>{`
        select.filterSelect option {
          background: #ffffff !important;
          color: #000000 !important;
          padding: 8px 12px;
        }
        select.filterSelect:focus option:checked {
          background: #f0f0f0 !important;
          color: #000000 !important;
        }
      `}</style>
      <div style={styles.page}>
        <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Kumaoni Stories</h1>
          <p style={styles.subtitle}>
            Discover traditional tales, fables, and folklore from the Kumaon region
          </p>
        </div>

        {/* Search and Filters */}
        <div style={styles.searchSection}>
          <div style={{...styles.searchBar, ...(searchFocused ? styles.searchBarFocus : {})}}>
            <Search size={20} color={searchFocused ? "#22d3ee" : "#666"} />
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filters}>
            <div 
              style={styles.filterGroup}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <Filter size={16} color="#22d3ee" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.filterSelect}
                className="filterSelect"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div 
              style={styles.filterGroup}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={styles.filterSelect}
                className="filterSelect"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 🎠 Famous Stories Carousel */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <TrendingUp size={20} color="#f59e0b" />
            <h2 style={styles.sectionTitle}>Famous Stories</h2>
          </div>
          
          {popular.length === 0 ? (
            <div style={styles.emptyState}>
              <TrendingUp size={48} color="#f59e0b" style={{ opacity: 0.5, marginBottom: 16 }} />
              <p style={styles.emptyText}>No famous stories yet</p>
              <p style={styles.emptySubtext}>
                Mark stories as famous in Supabase by setting <code style={styles.code}>is_famous = true</code>
              </p>
            </div>
          ) : (

            <div style={styles.carouselContainer}>
              <div style={styles.carousel}>
                {popular.map((story, index) => {
                  // Calculate position relative to current index
                  let position = index - currentIndex;
                  
                  // Handle wrapping for circular carousel
                  if (position > Math.floor(popular.length / 2)) {
                    position = position - popular.length;
                  } else if (position < -Math.floor(popular.length / 2)) {
                    position = position + popular.length;
                  }

                  // Scale and opacity based on distance from center
                  let scale = 1;
                  let opacity = 1;
                  let translateX = 0;
                  let zIndex = 5;
                  let filter = "none";

                  if (position === 0) {
                    // Center card (active) - current story
                    scale = 1;
                    opacity = 1;
                    translateX = 0;
                    zIndex = 10;
                    filter = "brightness(1)";
                  } else if (position === -1) {
                    // Left card (previous)
                    scale = 0.8;
                    opacity = 0.7;
                    translateX = -280;
                    zIndex = 4;
                    filter = "brightness(0.7)";
                  } else if (position === 1) {
                    // Right card (next)
                    scale = 0.8;
                    opacity = 0.7;
                    translateX = 280;
                    zIndex = 4;
                    filter = "brightness(0.7)";
                  } else if (position === -2) {
                    // Far left card
                    scale = 0.6;
                    opacity = 0.4;
                    translateX = -450;
                    zIndex = 2;
                    filter = "brightness(0.5)";
                  } else if (position === 2) {
                    // Far right card
                    scale = 0.6;
                    opacity = 0.4;
                    translateX = 450;
                    zIndex = 2;
                    filter = "brightness(0.5)";
                  } else {
                    // Hidden cards (further away)
                    scale = 0.4;
                    opacity = 0.1;
                    translateX = position < 0 ? -600 : 600;
                    zIndex = 1;
                    filter = "brightness(0.3)";
                  }

                  return (
                    <div
                      key={story.id}
                      style={{
                        ...styles.carouselCard,
                        transform: `translateX(${translateX}px) scale(${scale})`,
                        opacity,
                        zIndex,
                        filter,
                        cursor: position === 0 ? "pointer" : "default",
                        pointerEvents: position === 0 ? "auto" : "none",
                      }}
                      onClick={() => position === 0 && handleStoryClick(story.id)}
                    >
                      <img
                        src={story.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
                        alt={story.title}
                        style={styles.carouselImage}
                      />
                      <div style={styles.carouselOverlay}>
                        <h3 style={styles.popularTitle}>{story.title}</h3>
                        <p style={styles.popularSubtitle}>{story.subtitle}</p>
                        <p style={{ fontSize: 12, opacity: 0.8 }}>
                          <BookOpen size={12} /> {story.readCount || 0} reads
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div style={styles.carouselNav}>
                <button
                  style={styles.navButton}
                  onClick={handlePrev}
                  disabled={popular.length === 0}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  PREV
                </button>
                <button
                  style={styles.navButtonNext}
                  onClick={handleNext}
                  disabled={popular.length === 0}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 6px 30px rgba(16, 185, 129, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.4)";
                  }}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 📖 All Stories */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <BookOpen size={20} color="#3b82f6" />
            <h2 style={styles.sectionTitle}>
              {stories.length} {stories.length === 1 ? "Story" : "Stories"}
            </h2>
          </div>

          {stories.length === 0 ? (
            <div style={styles.emptyState}>
              <BookOpen size={48} color="#666" />
              <p>No stories found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={styles.storiesGrid}>
              {stories.map((story) => (
                <div
                  key={story.id}
                  style={{
                    ...styles.storyCard,
                    ...(hoveredCard === story.id ? styles.storyCardHover : {}),
                  }}
                  onClick={() => handleStoryClick(story.id)}
                  onMouseEnter={() => setHoveredCard(story.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.cardImageContainer}>
                    <img src={story.image} alt={story.title} style={styles.cardImage} />
                    <div style={styles.cardBadges}>
                      <span style={styles.levelBadge}>{story.level}</span>
                      {story.audioUrl && (
                        <span style={styles.audioBadge}>
                          <Play size={12} /> Audio
                        </span>
                      )}
                    </div>
                    {story.progressPercentage > 0 && (
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${story.progressPercentage}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{story.title}</h3>
                      <button
                        style={styles.favoriteButton}
                        onClick={(e) => handleFavorite(e, story.id)}
                      >
                        <Heart
                          size={18}
                          color={story.isFavorite ? "#ef4444" : "#666"}
                          fill={story.isFavorite ? "#ef4444" : "none"}
                        />
                      </button>
                    </div>
                    <p style={styles.cardSubtitle}>{story.subtitle}</p>
                    <p style={styles.cardDescription}>{story.description}</p>

                    <div style={styles.cardFooter}>
                      <div style={styles.cardMeta}>
                        <span style={styles.metaItem}>
                          <Clock size={14} /> {story.estimatedTime} min
                        </span>
                        <span style={styles.metaItem}>
                          <BookOpen size={14} /> {story.wordCount} words
                        </span>
                      </div>
                      <div style={styles.readButton}>
                        {story.readingStatus === "completed" ? (
                          <span style={styles.completedBadge}>✓ Completed</span>
                        ) : story.readingStatus === "in_progress" ? (
                          <span style={styles.progressBadge}>
                            Continue Reading <ArrowRight size={14} />
                          </span>
                        ) : (
                          <span style={styles.startButton}>
                            Start Reading <ArrowRight size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
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
  container: { maxWidth: 1200, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 40 },
  title: {
    fontSize: 42,
    fontWeight: 700,
    marginBottom: 12,
    background: "linear-gradient(90deg, #22d3ee 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: 18, opacity: 0.7 },
  searchSection: { marginBottom: 40 },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: "12px 20px",
    marginBottom: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  searchBarFocus: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(34,211,238,0.5)",
    boxShadow: "0 6px 20px rgba(34,211,238,0.2)",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e6edf6",
    fontSize: 16,
  },
  filters: { display: "flex", gap: 16, flexWrap: "wrap" },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "8px 16px",
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  filterGroupHover: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(34,211,238,0.3)",
  },
  filterSelect: {
    background: "transparent",
    border: "none",
    color: "#e6edf6",
    fontSize: 14,
    cursor: "pointer",
    // Style for dropdown options
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    outline: "none",
  },
  section: { marginBottom: 50 },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 24, fontWeight: 700 },
  carouselContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
    maxWidth: "100%",
    overflow: "visible",
    padding: "0 100px",
  },
  carousel: {
    position: "relative",
    width: "100%",
    maxWidth: 1200,
    height: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: "2000px",
    overflow: "visible",
    marginBottom: 40,
  },
  carouselCard: {
    position: "absolute",
    width: 650,
    height: 450,
    borderRadius: 24,
    overflow: "hidden",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, filter 0.6s ease",
    cursor: "pointer",
    border: "2px solid rgba(255,255,255,0.1)",
    willChange: "transform, opacity, filter",
    transformOrigin: "center center",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  carouselNav: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  navButton: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "12px 32px",
    color: "#e6edf6",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "1px",
    minWidth: 100,
  },
  navButtonNext: {
    background: "#10b981",
    border: "1px solid #10b981",
    borderRadius: 12,
    padding: "12px 32px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
    minWidth: 100,
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "30px 24px",
    background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7), transparent)",
    color: "#fff",
    textAlign: "center",
  },
  popularTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
  },
  popularSubtitle: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
    textShadow: "0 1px 5px rgba(0,0,0,0.8)",
  },
  storiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  storyCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
  },
  storyCardHover: {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 12px 40px rgba(34,211,238,0.3)",
    border: "1px solid rgba(34,211,238,0.3)",
  },
  cardImageContainer: { position: "relative", width: "100%", height: 180 },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    display: "flex",
    gap: 8,
  },
  levelBadge: {
    background: "#3b82f6",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  audioBadge: {
    background: "#10b981",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
  },
  cardContent: { padding: 20 },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: 700, flex: 1 },
  favoriteButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 1.6,
    marginBottom: 16,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMeta: { display: "flex", gap: 16, fontSize: 12, opacity: 0.7 },
  metaItem: { display: "flex", alignItems: "center", gap: 4 },
  readButton: { fontSize: 14, fontWeight: 600 },
  startButton: {
    color: "#22d3ee",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  progressBadge: {
    color: "#f59e0b",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  completedBadge: {
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    opacity: 0.6,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    border: "1px dashed rgba(255,255,255,0.1)",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
    color: "#e6edf6",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    color: "#e6edf6",
  },
  code: {
    background: "rgba(255,255,255,0.1)",
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },
  loading: {
    textAlign: "center",
    fontSize: 18,
    color: "#7f5af0",
    padding: "40px 20px",
  },
};
