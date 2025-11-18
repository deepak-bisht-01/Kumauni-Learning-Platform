import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added for redirect

const LoginRegister = () => {
  const navigate = useNavigate(); // ✅ Initialize navigation
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isMobile, setIsMobile] = useState(false);
  const [showRightHalf, setShowRightHalf] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragTranslate, setDragTranslate] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: "", text: "" });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: "", text: "" });
  };

  // ✅ LOGIN FUNCTION (with redirect)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        console.log("✅ User Token:", data.token);

        localStorage.setItem("token", data.token);

        setTimeout(() => {
          navigate("/dashboard"); // ✅ Redirect after success
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Login failed." });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Server not reachable." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER FUNCTION
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (registerData.password !== registerData.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters!" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: registerData.full_name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Registration successful! Please login.",
        });

        setTimeout(() => {
          setRegisterData({
            full_name: "",
            email: "",
            phone: "",
            password: "",
            confirm_password: "",
          });
          setIsLogin(true);
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Registration failed." });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Server not reachable." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/bg.jpg') center/cover no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: isMobile ? "12px" : "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          maxWidth: isMobile ? "560px" : "900px",
          width: isMobile ? "92vw" : "100%",
          display: "flex",
          minHeight: isMobile ? "420px" : "550px",
          flexDirection: "row",
        }}
      >
        <div
          ref={trackRef}
          onTouchStart={(e) => {
            if (!isMobile) return;
            setDragStartX(e.touches[0].clientX);
            setDragTranslate(showRightHalf ? -50 : 0);
          }}
          onTouchMove={(e) => {
            if (!isMobile || dragStartX === null) return;
            const dx = e.touches[0].clientX - dragStartX;
            const w = trackRef.current ? trackRef.current.offsetWidth : window.innerWidth;
            const half = Math.max(1, w / 2);
            const base = showRightHalf ? -50 : 0;
            let current = base + (dx / half) * 50;
            current = Math.max(-50, Math.min(0, current));
            setDragTranslate(current);
          }}
          onTouchEnd={(e) => {
            if (!isMobile || dragStartX === null) return;
            const dx = e.changedTouches[0].clientX - dragStartX;
            const threshold = 40;
            if (dx < -threshold) setShowRightHalf(true);
            else if (dx > threshold) setShowRightHalf(false);
            setDragStartX(null);
            setDragTranslate(showRightHalf ? -50 : 0);
          }}
          style={{
            display: "flex",
            width: isMobile ? "200%" : "100%",
            transform: isMobile
              ? `translateX(${dragStartX !== null ? dragTranslate : showRightHalf ? -50 : 0}%)`
              : "none",
            transition: isMobile ? (dragStartX !== null ? "none" : "transform 350ms ease") : "none",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #c3496bff 0%, #6f3aa4ff 100%)",
              color: "white",
              padding: isMobile ? "32px 24px" : "60px 40px",
              flex: isMobile ? "0 0 50%" : 1,
              minWidth: isMobile ? "50%" : undefined,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              minHeight: isMobile ? "240px" : undefined,
            }}
            onClick={() => {
              if (!isMobile) return;
              setShowRightHalf(true);
            }}
          >
            <div style={{ fontSize: isMobile ? "36px" : "48px", marginBottom: "16px" }}>📚</div>
            <h1 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 600 }}>Kumauni Siksha</h1>
            <p style={{ fontSize: isMobile ? "14px" : "16px", opacity: 0.9, lineHeight: 1.6 }}>
              Empowering education in the Kumaoni language and culture. Join us to
              preserve and promote our rich heritage.
            </p>
          </div>

          <div
            style={{
              flex: isMobile ? "0 0 50%" : 1,
              minWidth: isMobile ? "50%" : undefined,
              padding: isMobile ? "20px 16px" : "60px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            onClick={() => {
              if (!isMobile) return;
              setShowRightHalf(false);
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "20px",
              marginBottom: "30px",
              borderBottom: "2px solid #e0e0e0",
            }}
          >
            <button
              onClick={() => {
                setIsLogin(true);
                setMessage({ type: "", text: "" });
              }}
              style={{
                padding: "12px 0",
                fontSize: "18px",
                fontWeight: 600,
                color: isLogin ? "#667eea" : "#999",
                background: "none",
                border: "none",
                borderBottom: isLogin
                  ? "3px solid #667eea"
                  : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              Login
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                setMessage({ type: "", text: "" });
              }}
              style={{
                padding: "12px 0",
                fontSize: "18px",
                fontWeight: 600,
                color: !isLogin ? "#667eea" : "#999",
                background: "none",
                border: "none",
                borderBottom: !isLogin
                  ? "3px solid #667eea"
                  : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div
              style={{
                padding: "12px 16px",
                marginBottom: "20px",
                borderRadius: "8px",
                background:
                  message.type === "success" ? "#d4edda" : "#f8d7da",
                color: message.type === "success" ? "#155724" : "#721c24",
                border: `1px solid ${
                  message.type === "success" ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                style={inputStyle}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading}
                style={buttonStyle}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <input type="text" name="full_name" placeholder="Full Name" value={registerData.full_name} onChange={handleRegisterChange} required style={inputStyle} />
              <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required style={inputStyle} />
              <input type="text" name="phone" placeholder="Phone (optional)" value={registerData.phone} onChange={handleRegisterChange} style={inputStyle} />
              <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required style={inputStyle} />
              <input type="password" name="confirm_password" placeholder="Confirm Password" value={registerData.confirm_password} onChange={handleRegisterChange} required style={inputStyle} />
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 💅 Styles
const inputStyle = {
  width: "100%",
  padding: "clamp(10px, 2.8vw, 12px)",
  marginBottom: "clamp(12px, 3vw, 15px)",
  border: "2px solid #ddd",
  borderRadius: "8px",
};

const buttonStyle = {
  width: "100%",
  padding: "clamp(12px, 3vw, 14px)",
  fontSize: "clamp(14px, 3.6vw, 16px)",
  color: "#fff",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default LoginRegister;
