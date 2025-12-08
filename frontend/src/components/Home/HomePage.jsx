import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomeCulture = () => {
  const navigate = useNavigate();
  const [hindiText, setHindiText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hindiFullText = "वो भूली हुई धुन, फिर से गुनगुनाओ।";

  // Animate Hindi text typing
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= hindiFullText.length) {
        setHindiText(hindiFullText.slice(0, i));
        i++;
      } else clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Slideshow images
  const images = [
    "/images/kumaun1.png",
    "/images/kumaun2.jpg",
    "/images/kumaun3.jpg",
    "/images/kumaun4.jpg",
    "/images/kumaun5.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Floating Hindi letters
  useEffect(() => {
    const hindiLetters = [
      "अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ",
      "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ",
      "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ",
      "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह"
    ];

    const container = document.getElementById("floatingLetters");
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < 25; i++) {
        const letter = document.createElement("div");
        letter.className = "hindi-letter";
        letter.textContent =
          hindiLetters[Math.floor(Math.random() * hindiLetters.length)];
        letter.style.left = `${Math.random() * 100}%`;
        letter.style.animationDuration = `${10 + Math.random() * 10}s`;
        letter.style.animationDelay = `${Math.random() * 5}s`;
        letter.style.fontSize = `${2.2 + Math.random() * 1.8}rem`;
        container.appendChild(letter);
      }
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/register");
  const handleStart = () => {
    setShowPopup(true);
    setIsMenuOpen(false);
  };
  const handleBeginJourney = () => {
    setShowPopup(false);
    navigate("/login");
  };
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div className="home-culture-page">
      <style>{`
        /* 🌌 Global Page Styles */
        .home-culture-page {
          min-height: 100vh;
          color: white;
          font-family: 'Poppins', 'Noto Sans Devanagari', sans-serif;
          overflow-x: hidden;
          background: linear-gradient(180deg, #0e0e17 0%, #111424 40%, #1a0c2e 70%, #3f0535 100%);
          background-size: 200% 200%;
          animation: bgShift 15s ease infinite;
        }

        @keyframes bgShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        /* ====== Navbar ====== */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 50px;
          position: fixed;
          width: 100%;
          top: 0;
          left: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .nav-logo {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.5);
        }

        .nav-title {
          font-size: 26px;
          font-weight: 700;
          color: #22d3ee;
          letter-spacing: 0.5px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-right: 12px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .mobile-menu-button {
          display: none;
          background: transparent;
          border: none;
          color: #22d3ee;
          font-size: 1.8rem;
          cursor: pointer;
        }

        button {
          font-family: inherit;
        }

        /* 🌠 Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 120px 50px 60px;
          gap: 80px;
        }

        .image-box {
          width: 520px;
          height: 420px;
          border-radius: 25px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 0 30px rgba(127, 90, 240, 0.5),
                      0 0 60px rgba(34, 211, 238, 0.4);
          animation: floatGlow 6s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes floatGlow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.95; }
          50% { transform: translateY(-10px) scale(1.03); opacity: 1; }
        }

        .right-section {
          max-width: 550px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
        }

        .right-section h2 {
          font-size: 2rem;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .right-section h1 {
          font-size: 46px;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 20px;
        }

        .right-section p {
          font-size: 18px;
          color: #ccc;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        /* 🪷 Culture Section */
        .culture {
          min-height: 100vh;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 60px 100px;
          position: relative;
        }

        .left-content {
          flex: 1;
          text-align: left;
          max-width: 600px;
          z-index: 2;
        }

        .left-content h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #22d3ee, #7f5af0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-content p {
          font-size: 1.3rem;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.7;
        }

        .author {
          margin-top: 20px;
          font-size: 1.1rem;
          font-style: italic;
          color: #a78bfa;
          opacity: 0.9;
        }

        /* 🔡 Floating Hindi Letters */
        .hindi-letter {
          position: absolute;
          color: rgba(255, 255, 255, 0.25);
          font-weight: 700;
          pointer-events: none;
          animation: float 14s ease-in-out infinite;
          text-shadow: 0 0 12px rgba(100, 90, 255, 0.4);
        }

        @keyframes float {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px) rotate(360deg); opacity: 0; }
        }

        /* ===== Responsive ===== */
        @media (max-width: 1200px) {
          .hero {
            flex-direction: column;
            gap: 40px;
            padding: 120px 30px 60px;
            min-height: auto; /* don’t force full screen height on medium screens */
          }

          .image-box {
            width: 420px;
            height: 320px;
          }

          .culture {
            flex-direction: column;
            gap: 40px;
            padding: 60px 40px;
            text-align: center;
            min-height: auto; /* allow section to size to its content */
            justify-content: center; /* center quote block vertically on medium screens */
          }

          .left-content {
            text-align: center;
            align-items: center;
          }
        }

        @media (max-width: 768px) {
          nav {
            padding: 12px 24px;
          }

          .nav-right {
            display: none;
          }

          .nav-right {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .mobile-menu {
            position: fixed;
            top: 72px;
            right: 16px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(34, 211, 238, 0.2);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 120;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
            width: min(260px, 90vw);
          }

          .hero {
            padding: 110px 20px 50px;
            min-height: auto; /* avoid stacking multiple full-height sections on phones */
          }

          .right-section h1 {
            font-size: 2.6rem;
          }

          .right-section p {
            font-size: 16px;
          }
        }

        @media (max-width: 600px) {
          .nav-title {
            font-size: 20px;
          }

          .nav-logo {
            width: 40px;
            height: 40px;
          }

          .hero {
            padding: 90px 16px 40px;
            min-height: auto;
          }

          .image-box {
            width: 100%;
            max-width: 320px;
            height: 220px;
          }

          .right-section h2 {
            font-size: 1.5rem;
          }

          .right-section h1 {
            font-size: 2rem;
          }

          .culture {
            padding: 40px 20px;
            min-height: calc(100vh - 80px); /* fill most of the screen height on small phones */
            justify-content: center;        /* center quote block vertically on small phones */
          }

          .left-content h1 {
            font-size: 2rem;
          }

          .left-content p {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 400px) {
          .right-section h1 {
            font-size: 1.7rem;
          }

          .right-section p {
            font-size: 15px;
          }

          button {
            width: 100%;
          }
        }
      `}</style>

      {/* ===== Navbar ===== */}
      <nav>
        <div className="nav-left">
          <img src="/logo.png" alt="Kumauni Shiksha Logo" className="nav-logo" />
          <span className="nav-title">Kumauni Shiksha</span>
        </div>
        <div className="nav-right">
          <button onClick={handleLogin} style={buttonStyle.outline}>Login</button>
          <button onClick={handleSignUp} style={buttonStyle.gradient}>Sign Up</button>
        </div>
        <button
          className="mobile-menu-button"
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        {isMenuOpen && (
          <div className="mobile-menu">
            <button onClick={handleLogin} style={{ ...buttonStyle.outline, width: "100%" }}>
              Login
            </button>
            <button onClick={handleSignUp} style={{ ...buttonStyle.gradient, width: "100%" }}>
              Sign Up
            </button>
            <button
              onClick={handleStart}
              style={{ ...buttonStyle.gradient, width: "100%", marginTop: "8px" }}
            >
              Start Learning
            </button>
          </div>
        )}
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="image-box">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Kumauni Scene ${index}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "25px",
                opacity: currentImage === index ? 1 : 0,
                transition: "opacity 1.5s ease-in-out",
                filter: "brightness(0.9)",
              }}
            />
          ))}
        </div>

        <div className="right-section">
          <h2>{hindiText}</h2>
          <h1>
            Discover the Beauty of{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #22d3ee, #7f5af0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kumauni Language
            </span>
            .
          </h1>
          <p>
            Learn, connect, and celebrate Kumauni heritage through language, art, and culture.
          </p>
          <button
            onClick={handleStart}
            style={{ ...buttonStyle.gradient, padding: "16px 48px", fontSize: "20px" }}
          >
            Start Learning
          </button>
        </div>
      </section>

      {/* ===== Culture Section ===== */}
      <section className="culture">
        <div className="left-content">
          <h1>संस्कृति में प्रेरणा</h1>
          <p>“संस्कृति आत्मा का संगीत है, जो जीवन को गहराई देती है।”</p>
          <p>कुमाऊँ की परंपरा हमें जोड़ती ही नहीं, हमें जीवित रखती है।</p>
          <div className="author">— Kumauni Shiksha</div>
        </div>
        <div id="floatingLetters"></div>
      </section>

      {/* ===== Popup ===== */}
      {showPopup && (
        <div style={popup.overlay}>
          <div style={popup.container}>
            <h2 style={popup.title}>🎉 Welcome to Your Journey!</h2>
            <p style={popup.text}>Discover the beauty of the Kumauni language and culture.</p>
            <button onClick={handleBeginJourney} style={buttonStyle.gradient}>
              Begin Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Buttons ===== */
const buttonStyle = {
  outline: {
    padding: "clamp(8px, 2.2vw, 12px) clamp(14px, 4.5vw, 22px)",
    borderRadius: "30px",
    border: "2px solid #22d3ee",
    color: "#22d3ee",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s ease",
    fontSize: "clamp(12px, 2.6vw, 16px)",
  },
  gradient: {
    padding: "clamp(8px, 2.2vw, 12px) clamp(14px, 4.5vw, 22px)",
    borderRadius: "30px",
    background: "linear-gradient(90deg, #7f5af0, #22d3ee)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s ease",
    fontSize: "clamp(12px, 2.6vw, 16px)",
  },
};

/* ===== Popup Styles ===== */
const popup = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
  },
  container: {
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    borderRadius: "20px",
    padding: "2rem",
    textAlign: "center",
    maxWidth: "500px",
    color: "#fff",
    boxShadow: "0 0 40px rgba(127,90,240,0.3)",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    background: "linear-gradient(135deg, #f093fb, #22d3ee)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  text: {
    fontSize: "1rem",
    color: "#cbd5e1",
    marginBottom: "1.5rem",
  },
};

export default HomeCulture;
