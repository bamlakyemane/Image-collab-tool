// frontend/src/pages/Login.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/buttons.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionRedirect = sessionStorage.getItem("redirectAfterLogin");
  const from = sessionRedirect || location.state?.from || "/library";

  console.log("Login - sessionRedirect:", sessionRedirect);
  console.log("Login - final from:", from);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login - Already authenticated, redirecting to:", from);
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Login - Submitting form...");
    const result = await login(email, password);
    console.log("Login - Result:", result);

    if (result.success) {
      console.log("Login - Success, redirecting to:", from);
      const redirectPath = from;
      sessionStorage.removeItem("redirectAfterLogin");
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } else {
      setError(result.message || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {from !== "/library" && (
          <div style={styles.infoMessage}>
            🔒 Please log in to view the shared image
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* ✅ BUTTON WITH CENTERED WRAPPER */}
          <div style={styles.buttonWrapper}>
            <button
              type="submit"
              disabled={loading}
              className="animated-button"
              style={styles.animatedButton}
            >
              <svg
                viewBox="0 0 24 24"
                className="arr-2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
              <span className="text">
                {loading ? "Logging in..." : "Sign In"}
              </span>
              <span className="circle"></span>
              <svg
                viewBox="0 0 24 24"
                className="arr-1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
            </button>
          </div>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" state={{ from: from }} style={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    color: "#333",
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: "#666",
    fontSize: "16px",
  },
  infoMessage: {
    backgroundColor: "#cce5ff",
    color: "#004085",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    transition: "border-color 0.2s",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "8px",
  },
  animatedButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "14px 32px",
    border: "4px solid transparent",
    fontSize: "16px",
    backgroundColor: "white",
    borderRadius: "100px",
    fontWeight: "600",
    color: "#1f387e",
    boxShadow: "0 0 0 2px #1f387e",
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
    width: "auto",
    minWidth: "180px",
    maxWidth: "280px",
    justifyContent: "center",
    margin: "0 auto",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;
