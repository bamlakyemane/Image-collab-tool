// frontend/src/components/ThemeToggle.jsx

import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      style={{
        ...styles.button,
        backgroundColor: isDark ? "#334155" : "#f1f5f9",
      }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div
        style={{
          ...styles.thumb,
          transform: isDark ? "translateX(20px)" : "translateX(0)",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
};

const styles = {
  button: {
    width: "50px",
    height: "28px",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
    cursor: "pointer",
    padding: 0,
    position: "relative",
    transition: "background-color 0.3s ease",
  },
  thumb: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-card)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
};

export default ThemeToggle;
